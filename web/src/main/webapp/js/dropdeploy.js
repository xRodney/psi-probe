if (window.FormData) {
    function addEventHandler(obj, evt, handler) {
        if (obj.addEventListener) {
            // W3C method
            obj.addEventListener(evt, handler, false);
        } else if (obj.attachEvent) {
            // IE method.
            obj.attachEvent('on' + evt, handler);
        } else {
            // Old school method.
            obj['on' + evt] = handler;
        }
    }

    addEventHandler(window, 'load', function () {
        var drop = document.getElementById('drop');
        var deployDialog = document.getElementById('deployDialog');
        var progress = document.getElementById('progress');

        function cancel(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }

        // Tells the browser that we *can* drop on this target
        addEventHandler(drop, 'dragover', cancel);
        addEventHandler(drop, 'dragenter', cancel);

        addEventHandler(drop, 'drop', function (e) {
            e = e || window.event; // get window.event if e argument missing (in IE)
            if (e.preventDefault) {
                e.preventDefault();
            } // stops the browser from redirecting off to the image.

            var dt = e.dataTransfer;
            var files = dt.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.name.match(/.war$/)) {
                    displayForm(file);
                }
            }
            return false;
        });
    });

    function parseContext(name) {
        return name.match(/^(.*?)(-[0-9.]+)?(-[A-Za-z0-9.]+)?.war/)[1];
    }

    function displayForm(file) {
        deployDialog.style.display = "";
        deployDialog.querySelector("#filename").innerHTML = file.name;
        deployDialog.querySelector("#context").value = parseContext(file.name);

        addEventHandler(deployDialog.querySelector("form"), 'submit', function (e) {
            e = e || window.event; // get window.event if e argument missing (in IE)
            if (e.preventDefault) {
                e.preventDefault();
            } // stops the browser from redirecting off to the image.

            submitForm(e.target, file, deployFinished);
            return false;
        });
    }

    function submitForm(form, file, cb) {
        var formData = new FormData();
        formData.append('war', file);

        for (var i = 0; i < form.length; i++) {
            formData.append(form[i].name, form[i].value);
        }

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.open('POST', form.action);

        xhr.onload = function () {
            progress.value = progress.innerHTML = 100;
            cb(xhr.responseText);
        };

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                progress.value = progress.innerHTML = complete;
            }
        }

        xhr.send(formData);
    }

    function deployFinished(html) {
        document.open('text/html');
        document.write(html);
        document.close();
    }
}