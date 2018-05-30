# NodeBB plugin for exporting messages and attached files to TickerTocker content export service
 
**REQUIRED**

* npm
* node
* nodeBB

**INSTALL**

* Do clone this project to folder `/plugins` of nodeBB
* Add to config.json parameters, example:
 ```
 {
    "content-export": {
        "sslCryptoPrivateKeyPath": "ssl/dev/smarshNode.key",
        "sslCryptoPrivateKeyPassPhrase": "123456",
        "contentExportService": "https://127.0.0.1:8080"
    }
 }
 ```
 
```
$ npm install -S git+https://github.com/EffCreativeGroup/nodebb-plugin-content-export.git
```

* Restart nodeBB
* Install this plugin in admin panel

