/**
 * Created by krzysztof on 01/06/2017.
 */
"use strict";
var base = "http://localhost:8000";


var operations = function(url) {
    var self = ko.observableArray();

    self.get = function() {
        $.ajax({
            url: url,
            success: function (data) {
                $.each(data, function (i, item) {
                    self.push(item);
                })
            }
        })
    };

    self.post = function(object) {
        console.log("Started POST");
        console.log(object);
        $.ajax({
            method: "POST",
            url: url,
            contentType: "application/json",
            data: ko.mapping.toJSON(object),
            success: function() {
                //alert("Dodano pomyślnie");
                self.removeAll();
                self.get();
            },
            error: function () {
                alert("Nie dodano!");
            }
        })
    };

    self.put = function (object) {
        console.log(object);
        $.ajax({
            method: "PUT",
            url: base + links(object).self,
            contentType: "application/json",
            data: ko.mapping.toJSON(object),
            success: function () {
                self.removeAll();
                self.get();
            },
            error: function () {
                alert("Nie uaktualniono!");
            }
        })
    }

    self.delete = function(object) {
        console.log(object);
        $.ajax({
            method: "DELETE",
            url: base + links(object).self,
            success: function () {
                //alert("Usunięto pomyślnie!");
                self.removeAll();
                self.get();
            },
            error: function () {
                console.log(object);
                alert("Błąd usuwania!");
            }
        })
    }


    function links(object) {
        return object.link.reduce(function(map, obj) {
            map[obj.params.rel] = obj.href;
            return map;
        }, {});
    }

    return self;
};


function ViewModel() {
    var self = this;

    self.indexInput = ko.observable();
    self.nameInput = ko.observable();
    self.surnameInput = ko.observable();
    self.birthdateInput = ko.observable();

    self.students = new operations(base + "/students");
    self.students.get();
    self.students.new = function () {
        self.students.post({index: self.indexInput, name: self.nameInput, surname: self.surnameInput, birthdate: self.birthdateInput});
    };



    self.courseName = ko.observable();
    self.lecturerName = ko.observable();

    self.courses = new operations(base + "/courses");
    self.courses.get();
    self.courses.new = function () {
        self.courses.post({name: self.courseName, lecturer: self.lecturerName});
    };
    self.courses.seeGrades = function () {
        document.getElementById("courseGrades").style.display = "block";
        document.getElementById("coursesList").style.display = "none";
    }
}


var viewModel = new ViewModel();

$(document).ready(function () {
    ko.applyBindings(viewModel);
});

