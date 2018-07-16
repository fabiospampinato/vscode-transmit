
/* IMPORT */

import * as _ from 'lodash';
import * as applescript from 'applescript';
import * as vscode from 'vscode';
import Config from './config';
import Utils from './utils';

/* COMMANDS */

function command ( command, srcPath = '', dstPath = '' ) {

  const commands = ['connect', 'upload', 'download', 'synchronize'];

  if ( !_.includes ( commands, command ) ) return vscode.window.showErrorMessage ( `Unsupported command "${command}"` );

  const {favorite, domain, user, protocol, localRoot, remoteRoot} = Config.get ();

  if ( !favorite && ( !domain || !user || !protocol ) ) return vscode.window.showErrorMessage ( 'You should either set "favorite", or set "domain", "user" and "protocol"' );

  if ( !localRoot || !remoteRoot ) return vscode.window.showErrorMessage ( 'You should always set "localRoot" and "remoteRoot"' );

  if ( !srcPath || !dstPath ) srcPath = dstPath = '';

  applescript.execString (`
    -- DATA

    set website to { fav: "${favorite}", domain: "${domain}", user: "${user}", proto: "${protocol}", localRoot: "${localRoot}", remoteRoot: "${remoteRoot}" }
    set srcPath to "${srcPath}"
    set dstPath to "${dstPath}"

    -- CONNECT

    on startConnection ( website, newWindow )
      tell application "Transmit"
        if newWindow then
          make new document at end
        end if
        try
          set fav to item 1 of (favorites whose name equals (fav of website))
          set favFound to true
        on error
          set favFound to false
        end try
        tell current tab of first document
          if favFound then
            connect to fav
          else
            connect to address (domain of website) as user (user of website) with protocol (proto of website) with initial path (remoteRoot of website)
          end if
          tell local browser
            change location to path (localRoot of website)
          end tell
        end tell
      end tell
    end startConnection

    on connect ( website )
      tell application "Transmit"
        reopen
        activate
        try
          if address of remote browser of current tab of first document does not equal (domain of website) -- Another connection
            my startConnection ( website, true )
          end if
        on error -- No connection
          my startConnection ( website, false )
        end try
      end tell
    end connect

    -- UPLOAD

    on upload ( website, srcPath, dstPath )
      my connect ( website )
      tell application "Transmit"
        tell remote browser of current tab of last document
          upload item at path srcPath to dstPath
        end tell
      end tell
    end upload

    -- DOWNLOAD

    on download ( website, srcPath, dstPath )
      my connect ( website )
      tell application "Transmit"
        tell remote browser of current tab of last document
          download item at path srcPath to dstPath
        end tell
      end tell
    end download

    -- SYNCHRONIZE

    on synchronize ( website, srcPath, dstPath )
      my connect ( website )
      tell application "Transmit"
        tell current tab of last document
          if length of srcPath > 0 then
            tell local browser to change location to path srcPath
          else
            tell local browser to change location to path (rootLocal of website)
          end if
          if length of srcPath > 0 then
            tell local browser to change location to path dstPath
          else
            tell remote browser to change location to path (rootLocal of website)
          end if
          synchronize local browser to remote browser
        end tell
      end tell
    end synchronize

    -- RUN

    ${ command === 'connect' ? 'my connect ( website )' : ''}
    ${ command === 'upload' ? 'my upload ( website, srcPath, dstPath )' : ''}
    ${ command === 'download' ? 'my download ( website, srcPath, dstPath )' : ''}
    ${ command === 'synchronize' ? 'my synchronize ( website, srcPath, dstPath )' : ''}
  `);

}

function connect () {

  command ( 'connect' );

}

function upload ( filePath ) {

  const localPath = filePath || Utils.path.getCurrent ();

  if ( !localPath ) return vscode.window.showErrorMessage ( 'You have to open a file first' );

  const remotePath = Utils.path.getRemoteFolderPath ( localPath );

  command ( 'upload', localPath, remotePath );

}

function uploadContext ( file ) {

  upload ( file.fsPath );

}

function download ( filePath ) {

  const localPath = filePath || Utils.path.getCurrent ();

  if ( !localPath ) return vscode.window.showErrorMessage ( 'You have to open a file first' );

  const remotePath = Utils.path.getRemotePath ( localPath ),
        downloadPath = Utils.path.getDownloadFolderPath ();

  command ( 'download', remotePath, downloadPath );

}

function downloadContext ( file ) {

  download ( file.fsPath );

}

async function synchronize ( srcPath, dstPath ) {

  if ( !await Utils.prompt.confirmation ( 'Are you sure you want to start the synchronization?' ) ) return;

  command ( 'synchronize', srcPath, dstPath );

}

function synchronizeContext ( file ) {

  const localPath = file.fsPath,
        remotePath = Utils.path.getRemotePath ( localPath );

  synchronize ( localPath, remotePath );

}

/* EXPORT */

export {connect, upload, uploadContext, download, downloadContext, synchronize, synchronizeContext};
