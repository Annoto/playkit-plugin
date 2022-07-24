# PlayKit JS Annoto - plugin for the [PlayKit JS Player]

PlayKit JS Annoto plugin is written in [Typescript].

[typescript]: https://www.typescriptlang.org/

## Getting Started

### Prerequisites

The plugin requires [Kaltura Player] to be loaded first.

[kaltura player]: https://github.com/kaltura/kaltura-player-js

### Installing

Clone and run npm to install dependencies:

```sh
git clone https://github.com/Annoto/playkit-plugin.git
cd playkit-plugin
npm install
```

### Building

To build the player for production run:

```sh
npm run build
```

### Developing

To start developing run:

```sh
npm run dev
```

### Embed the plugin in your test page

To use the plugin, just add plugin bundle script to the page and setup the player:

```html
<script src="https://cdnapisec.kaltura.com/p/2302901/embedPlaykitJs/uiconf_id/50617632"></script>
<!--Kaltura player-->
<script src="https://cdn.annoto.net/playking-plugin/latest/plugin.js"></script>
<!--PlayKit Annoto plugin-->
<div id="kaltura_player_541994816" style="width: 100%; height: 560px;"></div>

<script type="text/javascript">
    const config = {
        targetId: 'kaltura_player_541994816',
        provider: { partnerId: 2302901, uiConfId: 50617632 },
        plugins: {
            // set the clientId, if not provided, Annoto will load in demo mode
            annoto: {
                // clientId: 'eyJhbGciOiJIUzI1NiJ9.ZjU4MTMy...',
            },
        }
    };
    const kalturaPlayer = KalturaPlayer.setup(config);
    kalturaPlayer.loadMedia({ entryId: '1_yhp21rlc' });

    // To use the annoto api, use the 'annoto' service:

    const annotoService = kalturaPlayer.getService('annoto');
    annotoService.getApi().then((api) => {
        console.info('api: ', api);
    });
    annotoService.onSetup((setupConfig) => {
        console.info('onSetup: ', setupConfig);
    });
</script>
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Annoto/playkit-plugin/tags).

## License

This project is licensed under the Apache 2.0 License License - see the [LICENSE.md](LICENSE.md) file for details.
