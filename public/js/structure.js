/*global moment */

(function () {

  function updateFileList() {
    $.ajax('/structure/list').done(function (files) {
      var $list = $('.structure-list').empty();
      files.forEach(function (file) {
        var $container = $('<div class="structure-item">\
          <div class="structure-item-title"></div>\
          <div class="structure-item-extra clearfix">\
            <div class="structure-item-upload-at"></div>\
            <div class="structure-item-view"><a class="role-pdb">Download PDB</a> | <a class="role-json">View JSON</a> | <a href="javascript:;" class="role-delete">Delete</a></div>\
          </div>\
        </div>');
        $container.attr('data-filename', file.filename);
        $container.attr('data-id', file._id);
        $container.find('.structure-item-title').text(file.title);
        $container.find('.structure-item-upload-at').text(moment(file.at).format('YYYY-MM-DD HH:mm:ss'));
        $container.find('.role-pdb').attr('href', '/uploads/' + file.filename + '.pdb');
        $container.find('.role-json').attr('href', '/uploads/' + file.filename + '.json');
        $container.appendTo($list);
      });
    });
  }

  function deleteFile(id) {
    $.post('/structure/' + id + '/delete').done(function () {
      updateFileList();
    });
  }

  $(document).ready(function () {
    updateFileList();
  });

  $(document).on('click', '.role-delete', function () {
    deleteFile($(this).closest('.structure-item').attr('data-id'));
  });
}());
