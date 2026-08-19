export interface GoogleDocFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleDocContent {
  documentId: string;
  title: string;
  bodyText: string;
  revisionId?: string;
}

/**
 * List Google Docs files from the user's Google Drive.
 */
export async function listGoogleDocs(accessToken: string): Promise<GoogleDocFile[]> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.document' and trashed = false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,createdTime,modifiedTime,webViewLink,iconLink)&pageSize=20`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Не вдалося завантажити список документів Google Docs');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Get Google Doc content by Document ID.
 */
export async function getGoogleDoc(accessToken: string, documentId: string): Promise<GoogleDocContent> {
  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Не вдалося завантажити вміст Google Doc');
  }

  const doc = await response.json();
  let extractedText = '';

  if (doc.body && doc.body.content) {
    for (const elem of doc.body.content) {
      if (elem.paragraph && elem.paragraph.elements) {
        for (const run of elem.paragraph.elements) {
          if (run.textRun && run.textRun.content) {
            extractedText += run.textRun.content;
          }
        }
      }
    }
  }

  return {
    documentId: doc.documentId,
    title: doc.title,
    bodyText: extractedText,
    revisionId: doc.revisionId,
  };
}

/**
 * Create a new Google Doc with title and optional body text.
 */
export async function createGoogleDoc(
  accessToken: string,
  title: string,
  initialText?: string
): Promise<GoogleDocFile> {
  // 1. Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Не вдалося створити документ Google Doc');
  }

  const newDoc = await createRes.json();

  // 2. Insert initial text if provided
  if (initialText && initialText.trim().length > 0) {
    await fetch(`https://docs.googleapis.com/v1/documents/${newDoc.documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: initialText,
            },
          },
        ],
      }),
    });
  }

  return {
    id: newDoc.documentId,
    name: newDoc.title || title,
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: `https://docs.google.com/document/d/${newDoc.documentId}/edit`,
  };
}

/**
 * Delete a Google Doc file from Drive.
 */
export async function deleteGoogleDoc(accessToken: string, documentId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Не вдалося видалити документ із Google Drive');
  }
}
