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

    self.getWithQuery = function(query) {
        $.ajax({
            url: self.url + "?" + $.param(query),
            success: function (data) {
                self.removeAll();
                $.each(data, function (i, item) {
                    self.push(item);
                })
            }
        })
    };

    return self;
};

function studentSearch() {
    var self = this;
    self.index = ko.observable('');
    self.name = ko.observable('');
    self.surname = ko.observable('');
    self.date = ko.observable('');
}

function courseSearch() {
    var self = this;
    self.name = ko.observable('');
    self.lecturer = ko.observable('');
}

function gradeSearch() {
    var self = this;
    self.grade = ko.observable('');
    //self.coursename = ko.observable('');
    self.studentname = ko.observable('');
    self.date = ko.observable('');
}

function ViewModel() {
    var self = this;

    self.nameInput = ko.observable();
    self.surnameInput = ko.observable();
    self.birthdateInput = ko.observable();

    self.students = new operations(base + "/students");
    self.students.get();
    self.students.search = new studentSearch();
    self.students.new = function () {
        self.students.post({name: self.nameInput, surname: self.surnameInput, birthdate: self.birthdateInput});
    };


    self.courseName = ko.observable();
    self.lecturerName = ko.observable();

    self.courses = new operations(base + "/courses");
    self.courses.get();
    self.courses.search = new courseSearch();
    self.courses.new = function () {
        self.courses.post({name: self.courseName, lecturer: self.lecturerName});
    };



    self.gradeValueInput = ko.observable();
    self.gradeCourseIdInput = ko.observable();
    self.gradeStudentIndexInput = ko.observable();
    self.gradeDateInput = ko.observable();

    self.grades = new operations();
    self.grades.currentCourseId = null;
    self.grades.search = new gradeSearch();
    self.courses.seeGrades = function (object) {
        self.grades.currentCourse = object;
        self.grades.url = base + links(object).self + "/grades";
        self.grades.removeAll();
        self.grades.get();

        window.location = "#courseGrades";
    };
    self.grades.new = function() {
        self.grades.post({
            course : { id : self.grades.currentCourse.id},
            student : {index : self.gradeStudentIndexInput},
            value : self.gradeValueInput,
            date : self.gradeDateInput
        });
    };

    self.grades.delete = function (object) {
        console.log(object);
        $.ajax({
            method: "DELETE",
            url: self.grades.url + "/" + object.id,
            success: function () {
                self.grades.removeAll();
                self.grades.get();
            },
            error: function () {
                alert("Błąd usuwania!");
            }
        })
    };

    self.grades.putt = function (object) {
        console.log(object.course.id);
        $.ajax({
            method: "PUT",
            url: self.grades.url + "/" + object.id,
            contentType: "application/json",
            data: ko.mapping.toJSON(object),
            success: function () {
                self.grades.removeAll();
                self.grades.get();
            },
            error: function () {
                alert("Nie uaktualniono!");
            }
        })
    };

    self.getCourseName = function (course) {
        return course.name;
    };

    self.getCourseValue = function (course) {
        return course.id;
    };

    self.getStudentName = function (student) {
        return student.name + " " + student.surname;
    };

    self.getStudentValue = function (student) {
        return student.index;
    };


    ko.computed(function() {
        return ko.toJSON(self.students.search);
    }).subscribe(function() {
        self.students.getWithQuery(self.students.search);
    });

    ko.computed(function() {
        return ko.toJSON(self.courses.search);
    }).subscribe(function() {
        self.courses.getWithQuery(self.courses.search);
    });

    ko.computed(function() {
        return ko.toJSON(self.grades.search);
    }).subscribe(function() {
        console.log(self.grades.search);
        self.grades.getWithQuery(self.grades.search);
    });
}

var viewModel = new ViewModel();

$(document).ready(function () {
    ko.applyBindings(viewModel);
});



