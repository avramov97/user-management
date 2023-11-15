let hiddenFlag = true;

let constants = {
    serviceUrl: "http://127.0.0.1:8000"
};

function loadNavbar() {
    let username = app.authorizationService.getUsername();
    if (app.authorizationService.getRole() === 'ROOT-ADMIN') {
        app.templateLoader.loadTemplate('.navbar-holder', 'navbar-root-admin');
    } else if (app.authorizationService.getRole() === 'ADMIN') {
        app.templateLoader.loadTemplate('.navbar-holder', 'navbar-admin');
    } else if (app.authorizationService.getRole() === 'MODERATOR') {
        app.templateLoader.loadTemplate('.navbar-holder', 'navbar-moderator');
    } else if (app.authorizationService.getRole() === 'ROLE_USER') {
        app.templateLoader.loadTemplate('.navbar-holder', 'navbar-user');
    } else {
        app.templateLoader.loadTemplate('.navbar-holder', 'navbar-guest');
    }

}

app.router.on('#/', null, function () {
    loadNavbar();
    app.templateLoader.loadTemplate('.app', 'home-guest');
});

app.router.on("#/users/login", null, function () {
    loadNavbar();
    app.templateLoader.loadTemplate('.app', 'login', function () {
        document.getElementById("registered_successfully").hidden = hiddenFlag;
        hiddenFlag = true;
        $('#login-user').click(function (e) {
            let username = $('#username').val();
            let password = $('#password').val();

            $.ajax({
                type: 'POST',
                url: constants.serviceUrl + '/login',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "username": username,
                    "password": password
                })
            }).done((data, status, request) => {
                let authToken = data.split('Bearer ')[1];
                app.authorizationService.saveCredentials(authToken);
                // loadNavbar();
                window.location.href = '#/users/all';
            }).fail((err) => {
                console.log(err);
                if(err.status == 401 || err.status == 403) {
                    document.getElementById("error_login").hidden = false;
                }
            });
        });
    });
});

app.router.on("#/users/register", null, function () {
    app.templateLoader.loadTemplate('.app', 'register', function () {
        (function() {
            'use strict';
                var forms = document.getElementsByClassName('needs-validation');
                var validation = Array.prototype.filter.call(forms, function(form) {
                    form.addEventListener('submit', function(event) {
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        else {
                            event.preventDefault();
                            event.stopPropagation();

                            var formData = new FormData($('.needs-validation')[0]);

                            let firstName = $('#firstName').val();
                            let lastName = $('#lastName').val();
                            let username = $('#username').val();
                            let email = $('#email').val();
                            let birthDate = $('#datetimepicker').val();
                            let password = $('#password').val();
                            let confirmPassword = $('#confirmPassword').val();
                            var birthDateFormat = new Date(birthDate);

                            $.ajax({
                                type: 'POST',
                                url: constants.serviceUrl + '/users/register',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': app.authorizationService.getCredentials()
                                },
                                data: JSON.stringify({
                                    "firstName": firstName,
                                    "lastName": lastName,
                                    "username": username,
                                    "email": email,
                                    "birthDate": birthDateFormat,
                                    "password": password,
                                    "confirmPassword": confirmPassword
                                })
                            }).done((data, request) => {
                                hiddenFlag = false;
                                window.location.href = '#/users/login';
                            }).fail((err) => {
                                if(err.responseText === 'Error: Username already exists. Please try with another one.') {
                                    $("#username").val('');
                                    document.getElementById("error_register").textContent = "Username already exists.";
                                }
                                else if(err.responseText === 'Error: Passwords do not match!') {
                                    document.getElementById("error_register").textContent = "Passwords did not match.";
                                }
                                console.log(err);
                                alert(err.responseText);
                                document.getElementById("error_register").hidden = false;
                                $("#password").val('');
                                $("#confirmPassword").val('');
                            });

                            form.classList.remove('was-validated');

                        }
                    }, false);
                });
        })();
    });
});

app.router.on("#/users/logout", null, function () {
    app.authorizationService.evictCredentials();
    window.location.href = '#/users/login';
});

app.router.on("#/users/all", null, function () {
    loadNavbar();
    $.ajax({
        type: 'GET',
        url: constants.serviceUrl + '/users/all',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': app.authorizationService.getCredentials()
        }
    }).done((data) => {
        app.templateLoader.loadTemplate('.app', 'users-all', function () {
            let loggedUsername = app.authorizationService.getUsername();
            $('#all-users').text('Welcome, ' + loggedUsername);

            let i = 1;
            for (let elem of data) {
                let uniqueElementId = elem['id'];
                let actionsId = 'actions-' + uniqueElementId;
                var formatDateBirth = new Date(elem['birthDate']).toLocaleDateString();

                if(elem['role'] === 'ROOT-ADMIN') {
                    $('.all-users')
                    .append('<tr>'
                            // + '<td class="id" style="display:none;">' + elem['id'] + '</td>'
                            + '<td class="first-name">' + elem['firstName'] + '</td>'
                            + '<td class="last-name">' + elem['lastName'] + '</td>'
                            + '<td class="username">' + elem['username'] + '</td>'
                            + '<td class="email">' + elem['email'] + '</td>'
                            + '<td class="date-birth">' + formatDateBirth + '</td>'
                            + '<td class="text-center">'
                            + '<div class="d-flex justify-content-center">'
                            + '<button type="button" class="edit-btn btn" disabled>'
                            + '<i class="fa fa-edit"></i>'
                            + '</button>'
                            + '<button type="button" class="delete-btn btn" disabled>'
                            + '<i class="fas fa-trash-alt"></i>'
                            + '</button>'
                            + '</div>'
                            + '</td>'
                            + '</tr>');
                }
                else {
                    $('.all-users')
                        .append('<tr>'
                            // + '<td class="id" style="display:none;">' + elem['id'] + '</td>'
                            + '<td class="first-name">' + elem['firstName'] + '</td>'
                            + '<td class="last-name">' + elem['lastName'] + '</td>'
                            + '<td class="username">' + elem['username'] + '</td>'
                            + '<td class="email">' + elem['email'] + '</td>'
                            + '<td class="date-birth">' + formatDateBirth + '</td>'
                            + '<td class="text-center">'
                            + '<div class="d-flex justify-content-center">'
                            + '<button type="button" class="edit-btn btn">'
                            + '<i class="fa fa-edit"></i>'
                            + '</button>'
                            + '<button type="button" class="delete-btn btn">'
                            + '<i class="fas fa-trash-alt"></i>'
                            + '</button>'
                            + '</div>'
                            + '</td>'
                            + '</tr>');
                }

                i++;
            }


            if(app.authorizationService.getRole() === 'ROLE_USER') {
                $( ".edit-btn" ).prop( "disabled", true );
                $( ".delete-btn" ).prop( "disabled", true );
            }
            else if(app.authorizationService.getRole() === 'MODERATOR') {
                $( ".delete-btn" ).prop( "disabled", true );
            }

            $('#refresh-users-button').click(function() {
                app.router.reload('#/users/all');
            });

            $('#create_account').click( function ()
            {
                $("#create_modal").modal();
            });

            $('.edit-btn').click( function ()
            {
                var $row = $(this).closest("tr");
                var $firstName = $row.find(".first-name").text();
                var $lastName = $row.find(".last-name").text();
                var $username = $row.find(".username").text();
                var $email = $row.find(".email").text();
                var $dateBirth = $row.find(".date-birth").text();

                $modal = $('#edit_modal');
                $editor = $('#editor');

                $editor.find('#firstName').val($firstName);
                $editor.find('#lastName').val($lastName);
                $editor.find('#username_edit').val($username);
                $editor.find('#email').val($email);
                $editor.find('#datetimepicker_modal').val($dateBirth);
                $modal.data('row', $row);
                $modal.modal('show');
            });

            $('.delete-btn').click( function ()
            {
                var result = confirm("Do you really want to remove the user?");
                if (result) {

                var $row = $(this).closest("tr");
                let username = $row.find(".username").text();

                $.ajax({
                    type: 'POST',
                    url: constants.serviceUrl + '/users/delete?username=' + username,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': app.authorizationService.getCredentials()
                    }
                }).done(() => {
                    app.router.reload('#/users/all');
                }).fail((err) => {
                    console.log(err);
                    // alert(err.responseText);
                }).always(function () {
                    //    app.router.reload('#/users/all');
                });
                }
            });


            (function() {
                'use strict';
                var forms = document.getElementsByClassName('needs-validation');
                var validation = Array.prototype.filter.call(forms, function(form) {
                    form.addEventListener('submit', function(event) {
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        else
                        {
                            event.preventDefault();
                            event.stopPropagation();

                            var formData = new FormData($('.needs-validation')[0]);

                            let firstName = $('#firstName').val();
                            let lastName = $('#lastName').val();
                            let username = $('#username_edit').val();
                            let email = $('#email').val();
                            let birthDate = $('#datetimepicker_modal').val();
                            let getBirthDate = new Date(birthDate);

                            $.ajax({
                                type: 'POST',
                                url: constants.serviceUrl + '/users/edit',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': app.authorizationService.getCredentials()
                                },
                                data: JSON.stringify({
                                    "firstName": firstName,
                                    "lastName": lastName,
                                    "username": username,
                                    "email": email,
                                    "birthDate": getBirthDate,
                                })
                            }).done(() => {
                                $('#edit_modal').modal('hide');
                                setTimeout(function(){ app.router.reload('#/users/all'); }, 150);
                            }).fail((err) => {
                                console.log(err);
                                alert(err.responseText);
                            }).always(function () {
                                //    app.router.reload('#/users/all');
                            });
                            form.classList.remove('was-validated');
                        }
                    }, false);
                });
            })();
            // Create Modal
            (function() {
                'use strict';
                var forms = document.getElementsByClassName('needs-validation-create');
                var validation = Array.prototype.filter.call(forms, function(form) {
                    form.addEventListener('submit', function(event) {
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        else
                        {
                            event.preventDefault();
                            event.stopPropagation();

                            var formData = new FormData($('.needs-validation')[0]);

                            let firstName = $('#first-name-create').val();
                            let lastName = $('#last-name-create').val();
                            let username = $('#username-create').val();
                            let email = $('#email-create').val();
                            let birthDate = $('#datetimepicker_modal_create').val();
                            let password = $('#password-create').val();
                            let confirmPassword = $('#confirm-password-create').val();

                            let formatBirthDate = new Date(birthDate);

                            $.ajax({
                                type: 'POST',
                                url: constants.serviceUrl + '/users/register',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': app.authorizationService.getCredentials()
                                },
                                data: JSON.stringify({
                                    "firstName": firstName,
                                    "lastName": lastName,
                                    "username": username,
                                    "email": email,
                                    "birthDate": formatBirthDate,
                                    "password": password,
                                    "confirmPassword": confirmPassword,
                                })
                            }).done(() => {
                                $('#create_modal').modal('hide');
                                setTimeout(function(){ app.router.reload('#/users/all'); }, 150);
                            }).fail((err) => {
                                console.log(err);
                                alert(err.responseText);
                            }).always(function () {
                                //    app.router.reload('#/users/all');
                            });
                            form.classList.remove('was-validated');
                        }
                    }, false);
                });
            })();

        });
    }).fail((err) => {
        console.log(err);
    });
});

app.router.on("#/organization", null, function () {
    $.ajax({
        type: 'GET',
        url: constants.serviceUrl + '/organization',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': app.authorizationService.getCredentials()
        }
    }).done((data) => {
        app.templateLoader.loadTemplate('.app', 'organization', function () {
            let i = 1;

            for (let elem of data) {
                let uniqueElementId = elem['id'];
                let actionsId = 'actions-' + uniqueElementId;

                $('.all-users-organization')
                    .append('<tr>'
                        + '<td class="id">' + i + '</td>'
                        + '<td class="first-name">' + elem['firstName'] + '</td>'
                        + '<td class="last-name">' + elem['lastName'] + '</td>'
                        + '<td class="username">' + elem['username'] + '</td>'
                        + '<td class="role">' + elem['role'] + '</td>'
                        + '<td id="' + actionsId + '" class="col-md-7 d-flex justify-content-between" scope="col">'
                        + '</td>'
                        + '</tr>');
                if(elem['username'] === app.authorizationService.getUsername()) {
                    $('#' + actionsId)
                        .append('<h5><button class="btn btn-secondary btn-sm px-4" disabled>Own Unchangeable</button></h5>');
                    uniqueElementId = null;
                }
                else {
                    if (elem['role'] === 'ROLE_USER') {
                        $('#' + actionsId)
                            .append('<h5><button class="btn btn-primary btn-sm promote-button">Promote</button></h5>')
                    } else if (elem['role'] === 'ROOT-ADMIN') {
                        $('#' + actionsId)
                            .append('<h5><button class="btn btn-secondary btn-sm px-4" disabled>Owner Unchangeable</button></h5>');
                            uniqueElementId = null;
                    } else if (elem['role'] === 'ADMIN') {
                        $('#' + actionsId)
                            .append('<h5><button class="btn btn-danger btn-sm demote-button">Demote</button></h5>');
                    }else {
                        $('#' + actionsId)
                            .append('<h5><button class="btn btn-primary btn-sm promote-button mr-2">Promote</button></h5>')
                            .append('<h5><button class="btn btn-danger btn-sm demote-button">Demote</button></h5>');
                    }
                }
                
                $('#' + actionsId + '>h5>.promote-button').click(function (e) {
                    $.ajax({
                        type: 'POST',
                        url: constants.serviceUrl + '/organization/promote?id=' + uniqueElementId,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': app.authorizationService.getCredentials()
                        }
                    }).done(function (data) {
                        console.log(data);
                    }).fail(function (err) {
                        console.log(err);
                    }).always(function () {
                        app.router.reload('#/organization');
                    })
                });

                $('#' + actionsId + '>h5>.demote-button').click(function (e) {
                    $.ajax({
                        type: 'POST',
                        url: constants.serviceUrl + '/organization/demote?id=' + uniqueElementId,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': app.authorizationService.getCredentials()
                        }
                    }).done(function (data) {
                        console.log(data);
                    }).fail(function (err) {
                        console.log(err);
                    }).always(function () {
                        app.router.reload('#/organization');
                    });
                });

                $('#refresh-users-button').click(function() {
                    app.router.reload('#/organization');
                });

                i++;
            }
        });
    }).fail((err) => {
        console.log(err);
    });
});

app.router.on("#/logs/all", null, function () {
    $.ajax({
        type: 'GET',
        url: constants.serviceUrl + '/logs/all',
        headers: {
            'Authorization': app.authorizationService.getCredentials()
        }
    }).done((data) => {
        app.templateLoader.loadTemplate('.app', 'logs-all', function () {
            let i = 1;
            for (let elem of data) {
                $('.all-logs')
                    .append('<tr>'

                        + '<td class="first-name" style="display:none;">' + elem['id'] + '</td>'
                        + '<td class="user">' + elem['user'] + '</td>'
                        + '<td class="operation">' + elem['operation'] + '</td>'
                        + '<td class="table-name">' + elem['tableName'] + '</td>'
                        + '<td class="date">' + elem['date'] + '</td>'
                        + '</tr>');

                i++;
            }

           if(app.authorizationService.getRole() === 'MODERATOR') {
                $( "#clear_selected" ).prop( "disabled", true );
                $( "#clear_all" ).prop( "disabled", true )
            }

            var table = $('#example').DataTable();
            var selectedRows = new Array();

            $('#example tbody').on( 'click', 'tr', function ()
            {
                $(this).toggleClass('selected');
            } );

            $('#clear_selected').click( function ()
            {
                var rows = table.rows('.selected').data();

                for(var i=0;i<rows.length;i++)
                {
                    selectedRows[i] = rows[i][0];
                }

                // alert(selectedRows);

                $.ajax({
                    type: 'POST',
                    url: constants.serviceUrl + '/logs/delete?logs=' + selectedRows,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': app.authorizationService.getCredentials()
                    }
                }).done(() => {
                    app.router.reload('#/logs/all');
                }).fail((err) => {
                    console.log(err);
                    alert(err);
                }).always(function () {
                });
            });

            $('#clear_all').click( function ()
            {
                $.ajax({
                    type: 'POST',
                    url: constants.serviceUrl + '/logs/delete/all',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': app.authorizationService.getCredentials()
                    }
                }).done(() => {
                    app.router.reload('#/logs/all');
                }).fail((err) => {
                    console.log(err);
                    alert(err);
                }).always(function () {
                });
            });

        });
    }).fail((err) => {
        console.log(err);
    });

    $('#refresh-logs-button').click(function() {
        app.router.reload('#/logs/all');
    });
});

window.location.href = '#/users/login';