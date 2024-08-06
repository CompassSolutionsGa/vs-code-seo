import * as vscode from 'vscode';
import * as he from 'he';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.checkSeo', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const text = document.getText();

      // Existing title and meta description checks
      checkTitleAndDescription(text);

      // Additional SEO checks
      checkMetaKeywords(text);
      checkViewportMetaTag(text);
      checkCanonicalLinks(text);
      checkAltAttributes(text);
      checkHeadings(text);
    }
  });

  context.subscriptions.push(disposable);
}

function checkTitleAndDescription(text: string) {
  const titleMatch = text.match(/<title>(.*?)<\/title>/i);
  const metaMatch = text.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*\/?>/i);

  titleAndMetaMessage(titleMatch, 60, 30, "title");
  titleAndMetaMessage(metaMatch, 160, 0, "meta description");
}

function titleAndMetaMessage(match: RegExpMatchArray | null, max: number, min: number, type: string) {
  if (match) {
    const content = he.decode(match[1]);
    if (content.length > max) {
      vscode.window.showWarningMessage(`${type} is too long: ${content.length} characters. Max is ${max}.`);
    } else if (content.length < min && min !== 0) {
      vscode.window.showWarningMessage(`${type} is too short: ${content.length} characters. Minimum is ${min}.`);
    } else {
      vscode.window.showInformationMessage(`${type} length is appropriate: ${content.length} characters.`);
    }
  } else {
    vscode.window.showErrorMessage(`No <${type}> tag found in the document.`);
  }
}

function checkMetaKeywords(text: string) {
  const match = text.match(/<meta\s+name=["']keywords["']\s+content=["'](.*?)["']\s*\/?>/i);
  if (!match) {
    vscode.window.showWarningMessage("No <meta name='keywords'> tag found. Consider adding one for older search engines.");
  }
}

function checkViewportMetaTag(text: string) {
  const match = text.match(/<meta\s+name=["']viewport["']\s+content=["'](.*?)["']\s*\/?>/i);
  if (!match) {
    vscode.window.showWarningMessage("No <meta name='viewport'> tag found. This is essential for mobile responsiveness.");
  }
}

function checkCanonicalLinks(text: string) {
  const match = text.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']\s*\/?>/i);
  if (!match) {
    vscode.window.showWarningMessage("No canonical link found. This can help avoid duplicate content issues.");
  }
}

function checkAltAttributes(text: string) {
  const imagesWithoutAlt = text.match(/<img(?![^>]*\balt=)[^>]*>/gi);
  if (imagesWithoutAlt) {
    vscode.window.showWarningMessage(`Found ${imagesWithoutAlt.length} images without alt attributes. These are crucial for SEO and accessibility.`);
  }
}

function checkHeadings(text: string) {
  const headings = text.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
  if (!headings || headings.length === 0) {
    vscode.window.showWarningMessage("No headings (<h1>-<h6>) found. Proper heading structure is crucial for SEO.");
  }
}
