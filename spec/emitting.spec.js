/*global describe,beforeEach,afterEach,it, Monologue */
function monoFactory() {
	return new Monologue();
}

describe( "Emitting Events", function() {
	var subA, subB, subAFired, subBFired;
	var events, envs;

	describe( "With plain topic matching", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subBFired = false;
			subA = monologue.on( "Some.Topic", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
			subB = monologue.on( "Some.Other.Topic", function( data, env ) {
				events.push( data );
				envs.push( env );
				subBFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
			subB.unsubscribe();
			monologue.off();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Some.Topic", "Hai" );
			events.length.should.equal( 1 );
			subAFired.should.equal( true );
			subBFired.should.equal( false );
			events[ 0 ].should.equal( "Hai" );
			envs[ 0 ].topic.should.equal( "Some.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
			monologue._cache.should.have.property( "Some.Topic" );
		} );

		it( "Emitting Some.Other.Topic should invoke subB callback", function() {
			monologue.emit( "Some.Other.Topic", "Hai, 2 U" );
			events.length.should.equal( 1 );
			subAFired.should.equal( false );
			subBFired.should.equal( true );
			events[ 0 ].should.equal( "Hai, 2 U" );
			envs[ 0 ].topic.should.equal( "Some.Other.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
			monologue._cache.should.have.property( "Some.Other.Topic" );
		} );

		it( "Should remove irrelevant cache entries", function() {
			var sub = monologue.on( "Yet.Another.Topic", function() {} );
			monologue.emit( "Yet.Another.Topic", "Hai, 2 U" );
			console.log( monologue._cache );
			monologue._cache.should.have.property( "Yet.Another.Topic" );
			sub.unsubscribe();
			console.log( monologue._cache );
			monologue._cache.should.not.have.property( "Yet.Another.Topic" );

		} );
	} );

	describe( "With wildcards involving * at start of binding", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "*.Topic", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Some.Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.UnMatching.Topic", "Hai 3" );
			events.length.should.equal( 1 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai" );
			envs[ 0 ].topic.should.equal( "Some.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
		} );
	} );

	describe( "With wildcards involving * at middle of binding", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "Some.*.Topic", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Some.Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.Other.Topic", "Hai 3" );
			events.length.should.equal( 1 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai 3" );
			envs[ 0 ].topic.should.equal( "Some.Other.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
		} );
	} );

	describe( "With wildcards involving * at end of binding", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "Some.*", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Some.Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.UnMatching.Topic", "Hai 3" );
			events.length.should.equal( 2 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai" );
			events[ 1 ].should.equal( "Hai 2" );
			envs[ 0 ].topic.should.equal( "Some.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
			envs[ 1 ].topic.should.equal( "Some.MOAR" );
			( envs[ 1 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 1 ].should.have.property( "data" );
		} );
	} );

	describe( "With wildcards involving # at start of binding", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "#.Topic", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Some.Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.Other.Topic", "Hai 3" );
			events.length.should.equal( 2 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai" );
			events[ 1 ].should.equal( "Hai 3" );
			envs[ 0 ].topic.should.equal( "Some.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
			envs[ 1 ].topic.should.equal( "Some.Other.Topic" );
			( envs[ 1 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 1 ].should.have.property( "data" );
		} );
	} );

	describe( "With wildcards involving # at middle of binding", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "Some.#.Topic", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic & Some.Other.Topic should invoke subA callback", function() {
			monologue.emit( "Some.Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.Other.Topic", "Hai 3" );
			events.length.should.equal( 2 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai" );
			events[ 1 ].should.equal( "Hai 3" );
			envs[ 0 ].topic.should.equal( "Some.Topic" );
			envs[ 1 ].topic.should.equal( "Some.Other.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			( envs[ 1 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
			envs[ 1 ].should.have.property( "data" );
		} );
	} );

	describe( "With wildcards involving # at end of binding", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "Some.#", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Some.Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.Other.Topic", "Hai 3" );
			events.length.should.equal( 3 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai" );
			events[ 1 ].should.equal( "Hai 2" );
			events[ 2 ].should.equal( "Hai 3" );
			envs[ 0 ].topic.should.equal( "Some.Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
			envs[ 1 ].topic.should.equal( "Some.MOAR" );
			( envs[ 1 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 1 ].should.have.property( "data" );
			envs[ 2 ].topic.should.equal( "Some.Other.Topic" );
			( envs[ 2 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 2 ].should.have.property( "data" );
		} );
	} );

	describe( "With wildcards matching only single word topics", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "*", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.UnMatching.Topic", "Hai 3" );
			events.length.should.equal( 1 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai" );
			envs[ 0 ].topic.should.equal( "Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
		} );
	} );

	describe( "With wildcards matching any length topic", function() {
		var monologue;
		beforeEach( function() {
			monologue = new monoFactory();
			events = [];
			envs = [];
			subAFired = false;
			subA = monologue.on( "#", function( data, env ) {
				events.push( data );
				envs.push( env );
				subAFired = true;
			} );
		} );

		afterEach( function() {
			subA.unsubscribe();
		} );

		it( "Emitting Some.Topic should invoke subA callback", function() {
			monologue.emit( "Topic", "Hai" );
			monologue.emit( "Some.MOAR", "Hai 2" );
			monologue.emit( "Some.Other.Topic", "Hai 3" );
			events.length.should.equal( 3 );
			subAFired.should.equal( true );
			events[ 0 ].should.equal( "Hai" );
			events[ 1 ].should.equal( "Hai 2" );
			events[ 2 ].should.equal( "Hai 3" );
			envs[ 0 ].topic.should.equal( "Topic" );
			( envs[ 0 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 0 ].should.have.property( "data" );
			envs[ 1 ].topic.should.equal( "Some.MOAR" );
			( envs[ 1 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 1 ].should.have.property( "data" );
			envs[ 2 ].topic.should.equal( "Some.Other.Topic" );
			( envs[ 2 ].timeStamp instanceof Date ).should.equal( true );
			envs[ 2 ].should.have.property( "data" );
		} );
	} );

	describe( "When customizing the envelope", function() {
		var monologue = new Monologue(),
			envelope, sub;

		it( "The default envelope should return expected object", function() {
			var result = monologue.getEnvelope();
			result.should.have.property( "timeStamp" );
		} );

		it( "A customized envelope should return the expected object", function() {
			monologue.getEnvelope = function( topic, data ) {
				return {
					topic: topic,
					timeStamp: new Date(),
					senderId: 8675309,
					data: data
				};
			};
			sub = monologue.on( "Anything", function( data, env ) {
				envelope = env;
			} );
			monologue.emit( "Anything", {
				msg: "Oh, hai"
			} );
			envelope.should.have.property( "timeStamp" );
			( envelope.timeStamp instanceof Date ).should.equal( true );
			envelope.should.have.property( "senderId" );
			envelope.senderId.should.equal( 8675309 );
			envelope.should.have.property( "data" );
			envelope.data.should.eql( {
				msg: "Oh, hai"
			} );
		} );
	} );

	describe( "When publishing empty data", function() {
		var monologue = new Monologue(),
			sub,
			fired = false,
			envelope;

		it( "A customized envelope should return the expected object", function() {
			sub = monologue.on( "Empty", function( data, env ) {
				fired = true;
				envelope = env;
				console.log( data, env );
			} );
			monologue.emit( "Empty" );
			fired.should.equal( true );
			( typeof envelope.data ).should.equal( "undefined" );
		} );
	} );

	// describe("When throwing exceptions in the subscriber", function() {
	//     describe("With error tracking ON", function() {
	//         var monologue = new Monologue(),
	//             subA, subB, subBFired;
	//         monologue._trackErrors = true;

	//         subA = monologue.on("Anything", function() {
	//             throw "O NOES!";
	//         });

	//         subB = monologue.on("Anything", function() {
	//             subBFired = true;
	//         });

	//         monologue.emit("Anything", {
	//             msg: "Oh, hai"
	//         });

	//         it("Should have fired the second subscriber", function() {
	//             expect(subBFired).to.be(true);
	//         });

	//         it("Should have captured the error", function() {
	//             expect(monologue._yuno.length).to.be(1);
	//             expect(monologue._yuno[0].exception).to.be("O NOES!");
	//         });
	//     });

	//     describe("With error tracking OFF", function() {
	//         var monologue = new Monologue(),
	//             subA, subB, subBFired;

	//         subA = monologue.on("Anything", function() {
	//             throw "O NOES!";
	//         });

	//         subB = monologue.on("Anything", function() {
	//             subBFired = true;
	//         });

	//         monologue.emit("Anything", {
	//             msg: "Oh, hai"
	//         });

	//         it("Should have fired the second subscriber", function() {
	//             expect(subBFired).to.be(true);
	//         });

	//         it("Should not have captured the error", function() {
	//             expect(monologue._yuno).to.be(undefined);
	//         });
	//     });
	// });
} );
