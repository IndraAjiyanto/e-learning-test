import { Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'node:stream';
import * as path from 'node:path';

@Injectable()
export class GoogleSlidesService {
    private getDriveClient(): { drive: drive_v3.Drive; folderId: string } {
        const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
        const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
        const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
            /\\n/g,
            '\n',
        );
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const delegatedUser = process.env.GOOGLE_DRIVE_IMPERSONATED_USER;

        if (!folderId) {
            throw new Error(
                'Google Slides is not configured. Set GOOGLE_DRIVE_FOLDER_ID and Google OAuth or service-account credentials.',
            );
        }

        const auth = oauthClientId && oauthClientSecret && oauthRefreshToken
            ? new google.auth.OAuth2(oauthClientId, oauthClientSecret)
            : clientEmail && privateKey
                ? new google.auth.JWT({
                    email: clientEmail,
                    key: privateKey,
                    scopes: ['https://www.googleapis.com/auth/drive'],
                    ...(delegatedUser ? { subject: delegatedUser } : {}),
                })
                : null;

        if (!auth) {
            throw new Error(
                'Google Slides is not configured. Set Google OAuth credentials or GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.',
            );
        }

        if (auth instanceof google.auth.OAuth2) {
            auth.setCredentials({ refresh_token: oauthRefreshToken });
        }

        return { drive: google.drive({ version: 'v3', auth }), folderId };
    }

    private async makePublic(drive: drive_v3.Drive, fileId: string) {
        if (process.env.GOOGLE_SLIDES_PUBLIC !== 'true') return;

        await drive.permissions.create({
            fileId,
            requestBody: { type: 'anyone', role: 'reader' },
            supportsAllDrives: true,
        });
    }

    private async publishPresentation(
        drive: drive_v3.Drive,
        fileId: string,
    ): Promise<string> {
        const revisions = await drive.revisions.list({
            fileId,
            fields: 'revisions(id)',
        });
        const revisionId = revisions.data.revisions?.at(-1)?.id;
        if (!revisionId) {
            throw new Error('Google Slides did not return a publishable revision.');
        }

        const published = await drive.revisions.update({
            fileId,
            revisionId,
            requestBody: {
                published: true,
                publishAuto: true,
                publishedOutsideDomain: true,
            },
            fields: 'publishedLink',
        });
        const publishedLink = published.data.publishedLink;
        if (!publishedLink) {
            throw new Error('Google Slides did not return a public presentation URL.');
        }
        return publishedLink;
    }

    private fileName(originalName: string): string {
        return path.basename(originalName).replace(/\.(pptx?|PPTX?)$/, '');
    }

    async upload(
        file: Express.Multer.File,
        existingUrl?: string,
        existingFileId?: string,
    ): Promise<{ url: string; fileId: string }> {
        const { drive, folderId } = this.getDriveClient();
        const existingId = existingFileId || existingUrl?.match(
            /docs\.google\.com\/presentation\/d\/(?!e\/)([^/]+)/,
        )?.[1];
        const media = {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
        };

        let created: drive_v3.Schema$File;
        try {
            const response = await drive.files.create({
                requestBody: {
                    name: this.fileName(file.originalname),
                    mimeType: 'application/vnd.google-apps.presentation',
                    parents: [folderId],
                },
                media,
                fields: 'id',
                supportsAllDrives: true,
            });
            created = response.data;
        } catch (error: any) {
            const message = error?.response?.data?.error?.message || error?.message;
            if (message?.toLowerCase().includes('storage quota')) {
                throw new Error(
                    'Google Drive storage quota is exceeded. Use a Shared Drive folder or configure GOOGLE_DRIVE_IMPERSONATED_USER for a Workspace user with available storage.',
                );
            }
            throw error;
        }

        const fileId = created.id;
        if (!fileId) throw new Error('Google Slides did not return a file ID.');

        await this.makePublic(drive, fileId);
        const publishedUrl = await this.publishPresentation(drive, fileId);
        if (existingId) {
            try {
                await drive.files.delete({ fileId: existingId, supportsAllDrives: true });
            } catch {
                // The old presentation may belong to a different Drive owner.
            }
        }
        return { url: publishedUrl, fileId };
    }

    async delete(fileUrl?: string, storedFileId?: string): Promise<void> {
        const fileId = storedFileId || fileUrl?.match(
            /docs\.google\.com\/presentation\/d\/(?!e\/)([^/]+)/,
        )?.[1];
        if (!fileId) return;

        const { drive } = this.getDriveClient();
        await drive.files.delete({ fileId, supportsAllDrives: true });
    }
}