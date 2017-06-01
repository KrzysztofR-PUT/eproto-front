/**
 * Created by krzysztof on 01/06/2017.
 */
"use strict";
var base = "http://localhost:8000/";


var operations = function(url) {
    var self = ko.observableArray();

    self.get = function() {
        $.ajax({
            url: url,
            success: function (data) {

                $.each(data, function (i, item) {
                    console.log(item);
                    self.push(item);
                })
            }
        })
    }

    return self;
}


function ViewModel() {
    var self = this;

    self.courses = new operations(base + "courses");
    self.courses.get();

    self.students = new operations(base + "students");
    self.students.get();

    console.log(self.courses);
}


var viewModel = new ViewModel();

$(document).ready(function () {
    ko.applyBindings(viewModel);
});

