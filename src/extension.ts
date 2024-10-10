import { workspace, ExtensionContext, window, TextDocument } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient;



export async function activate(context: ExtensionContext) {
	const name = 'purescript-lsp';

	console.log('Congratulations, "purecript-lsp" is now active!');
	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		command: "purs",
		args: ["lsp", "server",
			"--output-directory", "../../../output",
			"--log-level", "all",
			"src/**/*.purs",
			".spago/**/*.purs",
			".ff/p/*/*.purs",
			"../../../.spago/p/*/src/**/*.purs",
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
		diagnosticPullOptions: 
			{
				onChange: false,
				onSave: true,
			},
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'purescript',
		name,
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	await client.start();

}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
