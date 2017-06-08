/**
 * Created by krzysztof on 01/06/2017.
 */
"use strict";
var base = "http://localhost:8000";

function links(object) {
    return object.link.reduce(function(map, obj) {
        map[obj.params.rel] = obj.href;
        return map;
    }, {});
}

var operations = function(baseurl) {
    var self = ko.observableArray();
    self.url = baseurl;

    self.get = function() {
        $.ajax({
            url: self.url,
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
        console.log(self.url);
        $.ajax({
            method: "POST",
            url: self.url,
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
        console.log(links(object));
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
    };


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



    self.gradeValueInput = ko.observable();
    self.gradeCourseIdInput = ko.observable();
    self.gradeDateInput = ko.observable();

    self.grades = new operations();
    self.courses.seeGrades = function (object) {
        self.grades.url = base + links(object).self + "/grades";
        self.grades.removeAll();
        self.grades.get();

        window.location = "#courseGrades";
    };
    self.grades.new = function() {
        self.grades.post({
            course : { id : self.gradeCourseIdInput},
            student : {index : 111},
            value : self.gradeValueInput,
            date : self.gradeDateInput
        });
    };

    self.grades.remove = function (object) {
        console.log(object);
        var urlToDelete = self.grades.url + "/" + object.id;
        console.log(urlToDelete);
        $.ajax({
            method: "DELETE",
            url: urlToDelete,
            success: function () {
                //alert("Usunięto pomyślnie!");
                self.grades.removeAll();
                self.grades.get();
            },
            error: function () {
                alert("Błąd usuwania!");
            }
        })
    }

    self.getCourseName = function (course) {
        return course.name;
    };

    self.getCourseValue = function (course) {
        return course.id;
    }
}

var viewModel = new ViewModel();

$(document).ready(function () {
    ko.applyBindings(viewModel);
});



