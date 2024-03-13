
/* IMPORT */

import vscode from 'vscode';
import {alert, getActiveFilePath, prompt} from 'vscode-extras';
import {applescript, getDownloadFolderPath, getRemoteFolderPath, getRemotePath, getServer} from './utils';
import type {Server} from './types';

/* MAIN */

//TODO: Rewrite this more cleanly

const command = async ( command: 'connect' | 'upload' | 'download' | 'synchronize', srcPath: string = '', dstPath: string = '', server?: Server ): Promise<void> => {

  server ||= await getServer ();

  if ( !server ) return;

  const {favorite, domain, user, protocol, localRoot, remoteRoot} = server;

  if ( !favorite && ( !domain || !user || !protocol ) ) return alert.error ( 'You should either set "favorite", or set "domain", "user" and "protocol"' );

  if ( !localRoot || !remoteRoot ) return alert.error ( 'You should always set "localRoot" and "remoteRoot"' );

  if ( !srcPath || !dstPath ) srcPath = dstPath = '';

  applescript (`
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

};

const connect = async (): Promise<void> => {

  await command ( 'connect' );

};

const upload = async ( filePath: string ): Promise<void> => {

  const localPath = filePath || getActiveFilePath ();

  if ( !localPath ) return alert.error ( 'You have to open a file first' );

  const server = await getServer ();

  if ( !server ) return;

  const remotePath = getRemoteFolderPath ( server, localPath );

  await command ( 'upload', localPath, remotePath, server );

};

const uploadFile = async ( file: vscode.Uri ): Promise<void> => {

  await upload ( file.fsPath );

};

const download = async ( filePath: string ): Promise<void> => {

  const localPath = filePath || getActiveFilePath ();

  if ( !localPath ) return alert.error ( 'You have to open a file first' );

  const server = await getServer ();

  if ( !server ) return;

  const remotePath = getRemotePath ( server, localPath );
  const downloadPath = getDownloadFolderPath ();

  await command ( 'download', remotePath, downloadPath, server );

};

const downloadFile = async ( file: vscode.Uri ): Promise<void> => {

  await download ( file.fsPath );

};

const synchronize = async ( srcPath: string, dstPath: string, server?: Server ): Promise<void> => {

  if ( !await prompt.boolean ( 'Are you sure you want to start the synchronization?' ) ) return;

  await command ( 'synchronize', srcPath, dstPath, server );

};

const synchronizeFile = async ( file: vscode.Uri ): Promise<void> => {

  const localPath = file.fsPath;
  const server = await getServer ();

  if ( !server ) return;

  const remotePath = getRemotePath ( server, localPath );

  await synchronize ( localPath, remotePath, server );

};

/* EXPORT */

export {connect, upload, uploadFile, download, downloadFile, synchronize, synchronizeFile};
