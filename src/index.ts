
/* IMPORT */

import vscode from 'vscode';
import * as Commands from './commands';
import Contexts from './contexts';

/* MAIN */

const activate = (): void => {

  vscode.commands.registerCommand ( 'transmit.connect', Commands.connect );
  vscode.commands.registerCommand ( 'transmit.upload', Commands.upload );
  vscode.commands.registerCommand ( 'transmit.uploadFile', Commands.uploadFile );
  vscode.commands.registerCommand ( 'transmit.download', Commands.download );
  vscode.commands.registerCommand ( 'transmit.downloadFile', Commands.downloadFile );
  vscode.commands.registerCommand ( 'transmit.synchronize', Commands.synchronize );
  vscode.commands.registerCommand ( 'transmit.synchronizeFile', Commands.synchronizeFile );

  Contexts.refresh ();

  vscode.workspace.onDidChangeConfiguration ( Contexts.refresh );

};

/* EXPORT */

export {activate};
