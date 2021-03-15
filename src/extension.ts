'use strict';

import * as vscode from 'vscode';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.odooScaffold', (fileObj: { path: any; }) => {

        // Get project path
        const activeWorkspace = vscode.workspace.workspaceFolders;

        if (!activeWorkspace) {
            return;
        }

        const projectRoot = activeWorkspace[0].uri.fsPath;

        // Get path where module will be created
        let relativePath = fileObj ? fileObj.path : projectRoot;
        
        if (process.platform === 'win32' && relativePath.charAt(0) === '/') {
            relativePath = relativePath.substr(1);
        }

        // Get odoo-bin path from configuration
        const odooBinPath = vscode.workspace.getConfiguration('odooScaffold').get('odooBinPath');

        // Get Python enviromnent path
        const pythonPath = vscode.workspace.getConfiguration('odooScaffold').get('pythonVirtualEnv');

        if (!odooBinPath) {
            console.log('OdooBinPath not set in settings. Please add it');
            vscode.window.showInformationMessage('OdooBinPath not set in settings. Please add it');
            return;
        }

        if (!pythonPath) {
            console.log('pythonVirtualEnv not set in settings. Please add it');
            vscode.window.showInformationMessage('pythonVirtualEnv not set in settings. Please add it');
            return;
        }

        // User Input to path of new module
        vscode.window.showInputBox({
            value: relativePath || '',
            prompt: 'Enter path of new Odoo module (/path/subpath/to/module)',
            validateInput: (value: any) => {
                if (value) {
                    return null;
                }
                return 'Please enter a valid path';
            }
        }).then((fullPath: undefined) => {

            if (fullPath === undefined) {
                vscode.window.showInformationMessage('Invalid path!');
                return;
            }

            // User Input to path od new module
            vscode.window.showInputBox({
                prompt: 'Enter name of new Odoo module',
                validateInput: (value: any) => {
                    if (value) {
                        return null;
                    }
                    return 'Please enter a valid name to module';
                }
            }).then((module_name: undefined) => {

                if (module_name === undefined) {
                    vscode.window.showInformationMessage('Invalid module name!');
                    return;
                }

                const odooTemplatePath = vscode.workspace.getConfiguration('odooScaffold').get('odooTemplatePath');

                // Run odoo scaffold command
                // const spawn = require('child_process').spawnSync;

                var process;

                var { spawn } = require('child_process');
    
                if (!odooTemplatePath) {
                    console.log('OdooTemplatePath not set in settings.');

                    console.log(odooBinPath);
                    console.log(module_name);
                    console.log(fullPath);
                    console.log(pythonPath);

                    process = spawn(pythonPath, [odooBinPath, 'scaffold', module_name, fullPath]);

                    console.log('stdout ', process.stdout.toString());

                }
                else {
                    process = spawn(pythonPath, [odooBinPath, 'scaffold', '-t', odooTemplatePath, module_name, fullPath]);
                }

                process.stdout.on('data', (data: string) => {
                    console.log(`stdout: ${data}`);
                    vscode.window.showInformationMessage('Something went wrong with STDOUT');
                });

                process.stderr.on('data', (data: string) => {
                    console.log(`stderr: ${data}`);
                    vscode.window.showInformationMessage('Something went wrong with STDERR');
                });

                process.on('close', (code: string) => {
                    console.log(`child process exited with code ${code}`);
                    vscode.window.showInformationMessage('New Odoo module create successfully!');
                });

            });

        });

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
