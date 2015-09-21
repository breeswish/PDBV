/*global ohSnap */

var libStructure = {};

(function () {

  libStructure.currentStructure = 'none';

  libStructure.updateStructureList = function (notify) {
    if (notify === undefined) {
      notify = true;
    }
    $.ajax('/structure/list').done(function (data) {
      var select = $('#select_structure').empty();
      select.append('<option value="none">-- Select --</option>');
      data.forEach(function (struct) {
        var $option = $('<option></option>');
        $option.val(struct.filename);
        $option.text(struct.title);
        $option.appendTo(select);
      });
      if (notify) {
        ohSnap('Struct list updated.', 'blue');
      }
      select.val(libStructure.currentStructure);
    });
  };

  libStructure.clear = function () {

  };

  libStructure.applyStructure = function (filename, status) {
    // load file
    $.ajax('/uploads/' + filename + '.json').done(function (data) {
      var mol = PDBV.loader.load(data, filename);
      window.view.load(mol, status);
      window._pdbv_initialized = true;
      window._pdbv_socket.emit('action/updateStatus', {
        key: 'structure',
        scope: 'controller',
        value: filename
      });
    });
  };

}());
