describe("RouteCreator", function() {
  var subject;
  var controller;
  var router;
  beforeEach(function() {
    router = {
      route: sinon.spy()
    };
    controller = {
      name: "TestController",
      routes: ['edit/:id', '/beginning', 'ending/', '/both/'],
      router: router,
      edit: sinon.spy(),
      beginning: sinon.spy(),
      ending: sinon.spy(),
      both: sinon.spy()
    };
    subject = new Backbone.OnFire.RouteCreator(controller);
  });

  it("has a reference to the controller", function() {
    expect(subject.controller).to.equal(controller);
  });

  it("creates the route actions map", function() {
    expect(_(subject.routeActions).size()).to.equal(4);
  });

  it("has a rootSegment", function() {
    expect(subject.rootSegment).to.equal("test");
  });

  describe("trimSlashes", function() {
    it("trims slashes from the beginning of a string", function() {
      expect(subject.trimSlashes("/test")).to.equal("test");
    });

    it("trims slashes from the end of a string", function() {
      expect(subject.trimSlashes("test/")).to.equal("test");
    });

    it("preserves slashes in the middle of a string", function() {
      expect(subject.trimSlashes("/test/test/")).to.equal("test/test");
    });
  });

  describe("firstSegment", function() {
    it("returns the first segment of a slash delimited string", function() {
      expect(subject.firstSegment("/test/foo/")).to.equal("test");
    });
  });

  describe("normalizedControllerName", function() {
    it("returns a lower case string", function() {
      controller.name = "TEST";
      expect(subject.normalizedControllerName()).to.equal("test");
    });

    it("returns the controller name without Controller suffix", function() {
      expect(subject.normalizedControllerName()).to.equal("test");
    });

    it("returns the controller name without controller suffix", function() {
      controller.name = "Testcontroller";
      expect(subject.normalizedControllerName()).to.equal("test");
    });
  });

  describe("createRootSegment", function() {
    it("returns the normalized controller name", function() {
      subject.createRootSegment();
      expect(subject.rootSegment).to.equal("test");
    });

    describe("controller with root", function() {
      it("returns the controller's root", function() {
        controller.root = "root";
        subject.createRootSegment();
        expect(subject.rootSegment).to.equal(controller.root);
      });
    });
  });

  describe("createRouteAction", function() {
    beforeEach(function() {
      subject.routeActions = {};
      subject.createRouteAction('edit/:id');
    });

    it("creates a route action", function() {
      expect(subject.routeActions['edit/:id']).to.equal("edit");
    });
  });

  describe("normalizeRoutes", function() {
    it("removes beginning and trailing slashes from routes", function() {
      controller.routes.push("/foo/:bar/:baz/");
      subject.normalizeRoutes();
      expect(controller.routes.contains('edit/:id')).to.be.true;
      expect(controller.routes.contains('beginning')).to.be.true;
      expect(controller.routes.contains('ending')).to.be.true;
      expect(controller.routes.contains('both')).to.be.true;
      expect(controller.routes.contains('foo/:bar/:baz')).to.be.true;

      expect(controller.routes.contains('/beginning')).to.be.false;
      expect(controller.routes.contains('ending/')).to.be.false;
      expect(controller.routes.contains('/both/')).to.be.false;
      expect(controller.routes.contains('/foo/:bar/:baz/')).to.be.false;
    });
  });

  describe("createRouteActions", function() {
    beforeEach(function() {
      subject.routeActions = {};
      controller.routes.push("index");
      subject.createRouteActions();
    });

    it("creates a routeActions map", function() {
      expect(subject.routeActions['edit/:id']).to.equal("edit");
      expect(subject.routeActions['beginning']).to.equal("beginning");
      expect(subject.routeActions['ending']).to.equal("ending");
      expect(subject.routeActions['both']).to.equal("both");
      expect(subject.routeActions['index']).to.equal("index");
    });
  });

  describe("hasIndexRoute", function() {
    it("returns true when an index route exists", function() {
      controller.routes.push("/index/:id");
      expect(subject.hasIndexRoute()).to.be.true;
    });

    it("returns false when an index route does not exist", function() {
      expect(subject.hasIndexRoute()).to.be.false;
    });
  });

  describe("getIndexRoute", function() {
    it("returns the index route", function() {
      controller.routes.push("/index/:id");
      expect(subject.getIndexRoute()).to.equal("/index/:id");
    });
  });

  describe("createIndexRouteAction", function() {
    beforeEach(function() {
      subject.routeActions = {};
      subject.controller.index = sinon.spy();
      subject.createIndexRouteAction();
    });

    it("adds index to the routes", function() {
      expect(subject.hasIndexRoute()).to.be.true;
    });

    it("creates an index route action", function() {
      expect(subject.routeActions['index']).to.equal("index");
    });

    describe("with dynamic segments", function() {
      it("adds dynamic segments to the route", function() {
        controller.routes = ["index/:id"];
        subject.createIndexRouteAction();
        expect(subject.routeActions['index/:id']).to.equal("index");
      });

      it("works if defined without dynamic segments", function() {
        controller.routes = ["index"];
        subject.createIndexRouteAction();
        expect(subject.routeActions['index']).to.equal("index");
      });
    });
  });

  describe("validateRoutes", function() {
    beforeEach(function() {
      controller.routes.push('nonexistent');
    });

    it("throws an error on invalid routes", function() {
      expect(function() {
        subject.validateRoutes();
      }).to.throw("TestController: has no action matching route 'nonexistent'");
    });

    it("does not throw an error if all routes are valid", function() {
      controller.routes.pop();
      expect(function() {
        subject.validateRoutes();
      }).not.to.throw(new Error);
    });

    describe("without a router", function() {
      it("throws an error if it has routes and no router", function() {
        controller.router = undefined;
        expect(function() {
          subject.validateRoutes();
        }).to.throw("TestController: router is undefined");
      });
    });
  });

  describe("createRoutes", function() {
    beforeEach(function() {
      _.bindAll = sinon.spy();
      controller = {
        name: "TestController",
        routes: ['edit/:id', '/beginning', 'ending/', '/both/'],
        router: router,
        index: sinon.spy(),
        edit: sinon.spy(),
        beginning: sinon.spy(),
        ending: sinon.spy(),
        both: sinon.spy()
      };
      subject = new Backbone.OnFire.RouteCreator(controller);
      subject.createRoutes();
    });

    it("registers the routes", function() {
      expect(router.route).to.have.been.calledWith("test", controller.index);
      expect(router.route).to.have.been.calledWith("test/edit/:id", controller.edit);
      expect(router.route).to.have.been.calledWith("test/beginning", controller.beginning);
      expect(router.route).to.have.been.calledWith("test/ending", controller.ending);
      expect(router.route).to.have.been.calledWith("test/both", controller.both);
    });

    it("binds the route actions to the controller", function() {
      expect(_.bindAll).to.have.been.calledWith(controller, "index");
      expect(_.bindAll).to.have.been.calledWith(controller, "edit");
      expect(_.bindAll).to.have.been.calledWith(controller, "beginning");
      expect(_.bindAll).to.have.been.calledWith(controller, "ending");
      expect(_.bindAll).to.have.been.calledWith(controller, "both");
    });
  });

  describe("isIndexController", function() {
    it("determines if the controller is the index controller", function() {
      controller.name = "IndexController";
      expect(subject.isIndexController()).to.be.true;
      controller.name = "Indexcontroller";
      expect(subject.isIndexController()).to.be.true;
      controller.name = "indexController";
      expect(subject.isIndexController()).to.be.true;
      controller.name = "indexcontroller";
      expect(subject.isIndexController()).to.be.true;
      controller.name = "Index";
      expect(subject.isIndexController()).to.be.true;
      controller.name = "index";
      expect(subject.isIndexController()).to.be.true;

      controller.name = "ControllerIndex";
      expect(subject.isIndexController()).to.be.false;
      controller.name = "IndexFoo";
      expect(subject.isIndexController()).to.be.false;
    });
  });

  describe("IndexController", function() {
    beforeEach(function() {
      controller = {
        name: "IndexController",
        router: router,
        index: sinon.spy()
      };
      subject = new Backbone.OnFire.RouteCreator(controller);
    });

    it("doesn't create a rootSegment", function() {
      expect(subject.rootSegment).to.be.undefined;
    });

    it("doesn't create a routeActions map", function() {
      expect(subject.routeActions).to.be.undefined;
    });

    it("creates a root route with the index action", function() {
      expect(router.route).to.have.been.calledWith("", controller.index);
    });

    it("binds index to the controller", function() {
      expect(_.bindAll).to.have.been.calledWith(controller, "index");
    });

    describe("createIndexRoutes", function() {
      beforeEach(function() {
        controller = {
          name: "IndexController",
          router: router,
          index: sinon.spy()
        };
        _.bindAll = sinon.spy();
        subject = new Backbone.OnFire.RouteCreator(controller);
        subject.createIndexRoutes();
      });

      it("throws an error if no index action is defined", function() {
        controller.index = undefined;
        expect(function() {
          subject.createIndexRoutes();
        }).to.throw(controller.name + ": index action is undefined");
      });

      it("creates a root route with the index action", function() {
        expect(router.route).to.have.been.calledWith("", controller.index);
      });

      it("binds index to the controller", function() {
        expect(_.bindAll).to.have.been.calledWith(controller, "index");
      });
    });
  });
});
