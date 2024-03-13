
/* IMPORT */

import os from 'node:os';
import path from 'node:path';
import {alert, exec, getConfig, prompt} from 'vscode-extras';
import type {Options, Server} from './types';

/* MAIN */

const applescript = async ( script: string ): Promise<void> => {

  await exec ( 'osascript', ['-e', script] );

};

const getDownloadFolderPath = (): string => {

  return path.join ( os.homedir (), 'Downloads' );

};

const getDownloadPath = ( remotePath: string ): string => {

  const folderPath = getDownloadFolderPath ();
  const fileName = path.parse ( remotePath ).base;

  return `${folderPath}${path.sep}${fileName}`;

};

const getRemoteFolderPath = ( server: Server, localPath: string ): string => {

  return path.parse ( getRemotePath ( server, localPath ) ).dir;

};

const getRemotePath = ( server: Server, localPath: string ): string => {

  return `${server.remoteRoot.replace ( /[\\\/]+$/, '' )}${path.sep}${localPath.slice ( server.localRoot.length ).replace ( /^[\\\/]+/, '' )}`;

};

const getOptions = (): Options => {

  const config = getConfig ( 'transmit' );
  const servers = isArray ( config?.servers ) ? config.servers as Server[] : []; //TODO: Actually type-check this

  return { servers };

};

const getServers = (): Server[] => {

  return getOptions ().servers;

};

const getServer = async (): Promise<Server | undefined> => {

  const servers = getServers ();

  if ( !servers.length ) return alert.error ( 'No server defined under the "transmit.servers" setting' );

  if ( servers.length === 1 ) return servers[0];

  const items = servers.map ( server => ({
    server,
    label: server.favorite || server.domain,
    description: server.favorite ? server.domain : undefined
  }));

  const item = await prompt.select ( 'Select a server...', items );

  return item?.server;

};

const isArray = ( value: unknown ): value is unknown[] => {

  return Array.isArray ( value );

};

/* EXPORT */

export {applescript, getDownloadFolderPath, getDownloadPath, getRemoteFolderPath, getRemotePath, getOptions, getServers, getServer, isArray};
