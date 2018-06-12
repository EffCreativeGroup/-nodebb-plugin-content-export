<form role="form" class="content-export-settings">
  <div class="row">
    <div class="col-md-9">
      <div class="row">
        <div class="col-sm-2 col-xs-12 settings-header">General</div>

        <div class="col-sm-10 col-xs-12">
          <div class="form-group">
            <label for="ssl-crypto-private-key-path">Private Key Path</label>
            <input type="text"
                   id="ssl-crypto-private-key-path"
                   name="sslCryptoPrivateKeyPath"
                   title="sslCryptoPrivateKeyPath"
                   class="form-control"
                   placeholder="ssl/dev/smarshNode.key"/>
          </div>

          <div class="form-group">
            <label for="ssl-crypto-private-key-pass-phrase">Password</label>
            <input type="password"
                   id="ssl-crypto-private-key-pass-phrase"
                   name="sslCryptoPrivateKeyPassPhrase"
                   title="Password"
                   class="form-control"/>
          </div>

          <div class="form-group">
            <label for="content-export-service">Content Export Service</label>
            <input type="text"
                   id="content-export-service"
                   name="contentExportService"
                   title="Content Export Service"
                   class="form-control"
                   placeholder="https://127.0.0.1:8080"/>
          </div>
        </div>
      </div>


    </div>


  </div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
  <i class="material-icons">save</i>
</button>
