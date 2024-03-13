
/* IMPORT */

import vscode from 'vscode';
import {getServers} from './utils';

/* MAIN */

const Contexts = {

  /* API */

  refresh: (): void => {

    const servers = getServers ();
    const isEnabled = !!servers.length;

    vscode.commands.executeCommand ( 'setContext', 'isTransmitEnabled', isEnabled );

  }

};

/* EXPORT */

export default Contexts;
