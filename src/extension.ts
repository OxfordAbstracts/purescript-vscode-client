import { workspace, ExtensionContext, window, TextDocument } from 'vscode';
import {
	CloseAction,
	ErrorAction,
	LanguageClient,
	LanguageClientOptions,
	RevealOutputChannelOn,
	ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
	const name = 'purescript-lsp';

	console.log('Congratulations, "purecript-lsp" is now active!');
	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		command: "/Users/rorycampbell/.local/bin/purs",
		args: ["lsp", "server",
			"--log-level", "debug",
			"src/**/*.purs",
			".spago/**/*.purs",
		],
	};

	const outputChannel = window.createOutputChannel(name);

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [
			{
				scheme: 'file',
				language: 'purescript',
				pattern: '**/*.purs'
			}],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		outputChannel,
		diagnosticCollectionName: name,
		outputChannelName: name,
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'purescript',
		name,
		serverOptions,
		clientOptions
	);

	workspace.onDidSaveTextDocument(async (document: TextDocument) => {
		console.log('onDidSaveTextDocument', document.languageId);

		if (document.languageId === 'purescript') {
			console.log('onDidSaveTextDocument', document.uri);
			const params = {
				textDocument: {
					uri: document.uri.toString(),
					id: document.uri.toString(),
				},
				id: document.uri.toString(),
			};
			client.sendRequest('textDocument/diagnostic', params);
		}
	});


	// client.registerProposedFeatures();
	// Start the client. This will also launch the server
	await client.start();

}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
