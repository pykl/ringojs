var {Application, Mount} = require("../lib/stick");
var assert = require("assert");


exports.testMiddleware = function() {
    function twice(next, app) {
        return function(req) {
            return next(req) + next(req)
        }
    }
    function uppercase(next, app) {
        return function(req) {
            return next(req.toUpperCase()).toUpperCase()
        }
    }
    function foobar(next, app) {
        return function(req) {
            return req === "FOO" ?
                "bar" : "unexpected req: " + req
        }
    }
    function append_(next, app) {
        return function(req) {
            return next(req) + "_"
        }
    }
    function _prepend(next, app) {
        return function(req) {
            return "_" + next(req)
        }
    }
    var app = new Application(twice, uppercase, foobar);
    assert.equal(app("foo"), "BARBAR");
    app = new Application();
    app.configure([twice, uppercase, foobar]);
    assert.equal(app("foo"), "BARBAR");
    app.configure("development", twice);
    app.configure("production", [_prepend, append_]);
    assert.equal(app("foo"), "BARBAR");
    assert.equal(app("foo", "development"), "BARBARBARBAR");
    assert.equal(app("foo", "production"), "_BARBAR_");
};

exports.testMount = function() {
    function testMount(app) {
        app.mount("/foo", function() { return "/foo" });
        app.mount({host: "foo.com"}, function() { return "foo.com" });
        app.mount({host: "bar.org", path: "/baz"}, function() { return "bar.org/baz" });
        assert.equal(app({headers: {host: "bar.com"}, pathInfo: "/foo"}), "/foo");
        assert.equal(app({headers: {host: "foo.com"}, pathInfo: "/foo"}), "/foo");
        assert.equal(app({headers: {host: "foo.com"}, pathInfo: "/"}), "foo.com");
        assert.equal(app({headers: {host: "bar.org"}, pathInfo: "/baz"}), "bar.org/baz");
        assert.throws(function() {
            app({headers: {host: "bing.org"}, pathInfo: "/"});
        }, Error);
    }
    var app = new Application(Mount);
    testMount(app);
    app = new Application();
    app.configure(Mount);
    testMount(app);
    app = new Application();
    app.configure([Mount]);
    testMount(app);
};

if (require.main == module) {
    require("test").run(exports);
}