
/* IMPORT */

import * as _ from 'lodash';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from './config';
import * as Commands from './commands';

/* UTILS */

const Utils = {

  initCommands ( context: vscode.ExtensionContext ) {

    const {commands} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-transmit' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, handler );

      context.subscriptions.push ( disposable );

    });

    return Commands;

  },

  path: {

    getCurrent () {

      const editor = vscode.window.activeTextEditor;

      if ( !editor ) return '';

      const filePath = editor.document.uri.fsPath;

      if ( !path.isAbsolute ( filePath ) ) return '';

      return filePath;

    },

    getRemoteFolderPath ( server, localPath ) {

      return path.parse ( Utils.path.getRemotePath ( server, localPath ) ).dir;

    },

    getRemotePath ( server, localPath ) {

      return `${_.trimEnd ( server.remoteRoot, path.sep )}${path.sep}${_.trimStart ( localPath.slice ( server.localRoot.length ), path.sep )}`;

    },

    getDownloadFolderPath () {

      return path.join ( os.homedir (), 'Downloads' );

    },

    getDownloadPath ( remotePath ) {

      const folderPath = Utils.path.getDownloadFolderPath (),
            fileName = path.parse ( remotePath ).base;

      return `${folderPath}${path.sep}${fileName}`;

    }

  },

  prompt: {

    async confirmation ( message = 'Are you sure you want to perform this action?' ) {

      const option = await vscode.window.showInformationMessage ( message, { title: 'Cancel' }, { title: 'Yes' } );

      return option && option.title === 'Yes';

    },

    async server ( servers = Config.get ().servers ) {

      if ( !servers.length ) {

        vscode.window.showErrorMessage ( 'No server defined under the "transmit.servers" setting' );

      } else if ( servers.length === 1 ) {

        return servers[0];

      } else {

        const items = servers.map ( server => ({
          server,
          label: server.favorite || server.domain,
          description: server.favorite ? server.domain : undefined
        }));

        const item = await vscode.window.showQuickPick ( items, { placeHolder: 'Select a server...' } );

        if ( item ) return item['server'];

      }

    }

  }

};

/* EXPORT */

export default Utils;
