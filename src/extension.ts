
/* IMPORT */

import * as vscode from 'vscode';
import Config from './config';
import Utils from './utils';

/* ACTIVATE */

function activate ( context: vscode.ExtensionContext ) {

  function setContext () {
    const {favorite, domain} = Config.get ();
    vscode.commands.executeCommand ( 'setContext', 'isTransmitEnabled', favorite || domain );
  }

  setContext ();

  vscode.workspace.onDidChangeConfiguration ( setContext );

  return Utils.initCommands ( context );

}

/* EXPORT */

export {activate};
