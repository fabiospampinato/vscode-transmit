# Transmit

<p align="center">
	<img src="https://raw.githubusercontent.com/fabiospampinato/vscode-transmit/master/resources/logo-128x128.png" alt="Logo">
</p>

Adds a few commands for interacting with [Transmit](https://panic.com/transmit).

## Install

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-transmit), or run the following in the command palette:

```shell
ext install fabiospampinato.vscode-transmit
```

## Usage

It adds 4 commands to the command palette:

```js
'Transmit: Connect' // Connect to the server
'Transmit: Upload' // Upload the current file to the server
'Transmit: Download' // Download the current file from the server
'Transmit: Synchronize' // Synchronize local and remote roots
```

You can also right click a single file/folder for uploading/downloading/synchronizing it.

## Settings

You should provide at least one server object with all of its properties.

```js
{
  "transmit.servers": [ // List of servers
    { // Server object
      "favorite": "", // Name of the Transmit favorite to use
      "domain": "", // Domain to connect to (e.g. example.com)
      "user": "root", // User used in the connection
      "protocol": "SFTP", // Protocol used in the connection
      "localRoot": "", // Local root path
      "remoteRoot": "" // Remote root path
    },
    ...
  ]
}
```

## Related

- **[Open in Transmit](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-open-in-transmit)**: Adds a few commands for opening the current file or project in Transmit.

## License

MIT © Fabio Spampinato
