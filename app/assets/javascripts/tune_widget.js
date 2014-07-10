
// TODO:
//   * For midi numbers, previous accidentals in the measure must be considered

$(document).ready(function() {
    function widget(container) {
	var source = $('<div class="tune_source"></div>');
	var sheet = $('<div class="tune_sheet"></div>');
	var midi = $('<div class="midi"></div>');
	$(container).addClass('tune_widget').append(source, sheet, midi);

	this.container = $(container);
	this.source = source;
	this.sheet = sheet;
	this.midi = midi;

	this.key = 'Cmaj';
    }

    window.widget = widget;

    widget.noteToMidiOrd = function(note) {
	// does not handle sharps/flats/keysig
	var ord = this.noteToOrd(note, true);
	var reford = this.noteToOrd('C', true);
	return 60 + (ord - reford);
    };

    widget.noteToOrd = function(note, chromatic) {
	// Middle C = 21
	var mdata, shift = 0;
	var octshift = chromatic ? 12 : 7;
	note = note.match(/([A-Ga-g][,']*)/)[1];
	while((mdata = note.match(/[,']/))) {
	    note = note.replace(/[,']/, '');
	    shift += (mdata[0] == ',') ? -octshift : octshift;
	}
	var key = note.match(/[A-Ga-g]/);
	var bases;
	if (chromatic)
	    bases = {
		'C': 21, 'D': 23, 'E': 25, 'F': 26, 'G': 28, 'A': 30, 'B': 32,
		'c': 33, 'd': 35, 'e': 37, 'f': 38, 'g': 40, 'a': 42, 'b': 44
	    };
	else
	    bases = {
		'C': 21, 'D': 22, 'E': 23, 'F': 24, 'G': 25, 'A': 26, 'B': 27,
		'c': 28, 'd': 29, 'e': 30, 'f': 31, 'g': 32, 'a': 33, 'b': 34
	    };
	return bases[key] + shift;
    };

    widget.ordToNote = function(ord) {
	var shift = '';
	while (ord < 21) {
	    shift += ",";
	    ord += 7;
	}
	while (ord > 34) {
	    shift += "'";
	    ord -= 7;
	}
	var bases = {
	    21: 'C', 22: 'D', 23: 'E', 24: 'F', 25: 'G', 26: 'A', 27: 'B',
	    28: 'c', 29: 'd', 30: 'e', 31: 'f', 32: 'g', 33: 'a', 34: 'b'
	};
	return bases[ord] + shift;

    };


    widget.prototype = {
	toggleOptions: function() {
	    var widget = this;
	    if (!this._options_modal) {
		(function() {
		    var modal = $('<div tabindex="-1"/>').addClass('modal options');
		    var pane = $('<div/>').addClass('modal-body');

		    var keysigs = [
			['Cmaj', 'Amin'],

			['Gmaj', 'Emin'],
			['Dmaj', 'Bmin'],
			['Amaj', 'F#min'],
			['Emaj', 'C#min'],
			['Bmaj', 'G#min'],
			['F#maj', 'D#min'],
			['C#maj', 'A#min'],

			['Cmaj', 'Amin'],

			['Fmaj', 'Dmin'],
			['Bbmaj', 'Cmin'],
			['Ebmaj', 'Gmin'],
			['Abmaj', 'Fmin'],
			['Dbmaj', 'Bbmin'],
			['Gbmaj', 'Ebmin'],
			['Cbmaj', 'Abmin']
		    ];

		    var keysigend;
		    var oldfn = ABCJS.write.Layout.prototype.printKeySignature;
		    ABCJS.write.Layout.prototype.printKeySignature = function() {
			var sup = oldfn.apply(this, arguments);
			keysigend = sup.x + sup.w;
			return sup;
		    };

		    var table = $('<table/>'),
			tr = table.append($('<tr/>')).find('tr').first();
		    table.css({'margin-left': 'auto', 'margin-right': 'auto'})
		    pane.append('<h3>Key Signature</h3>', table);
		    for (var sig, btns, i=0; i < keysigs.length; ++i) {
			if (i == 8) {
			    tr = table.append($('<tr/>')).find('tr').last();
			    tr.append('<td />');
			    continue;
			}

			sig = $('<td/>')
			ABCJS.renderAbc(sig[0], 'K: '+keysigs[i][0]+"\nz",
					{}, {
					    paddingtop: -45,
					    paddingbottom: -75,
					    paddingleft: 0,
					    paddingright: 0,
					    staffwidth: 1
					});

			sig.find('svg').css('width', (60 + keysigend)+'px');
			sig.css('width', 'auto');

			btns = $('<div/>')
			btns.addClass('btn-group btn-group-justified');
			btns.append($('<span class="btn btn-mini">').
				    text(keysigs[i][0]));
			btns.append($('<span class="btn btn-mini">').
				    text(keysigs[i][1]));
			sig.append(btns);

			sig.find('.btn').click(function() {
			    widget.key = $(this).text();
			    modal.find('.btn').removeClass('active');
			    $(this).addClass('active');
			}).filter(function() {
			    return this.innerText == widget.key
			}).addClass('active');
			tr.append(sig);
		    };

		    modal.append(
			$('<div/>').addClass('modal-dialog modal-lg').append(
			    $('<div/>').addClass('modal-content').html(pane)
			)
		    ).css({'width': '1000px', 'margin-left': '-500px'}).modal();
		    widget._options_modal = modal;
		})();
	    } else {
		this._options_modal.modal('toggle');
	    }
	},

	state: function(f, call_with_no_note) {
	    var note = null, line = this.source.find('.tune_line.active input');
	    if (line[0]) {
		note = line[0].value.
		    match(/((\(\d)?[=^_]?[A-Ga-g][,']*\d?\s*\|?\s*)$/);
	    }
	    var state = { line: line[0], note: note && note[1]};

	    if ((state.note || call_with_no_note) && typeof f == 'function')
		f.call(this, state);

	    return state;
	},

	addStaffLine: function() {
	    var current_line = this.source.find('.tune_line.active')[0];
	    var line = $('<div class="tune_line active"></div>').html('<input/>');

	    this.source.find('.active').removeClass('active');

	    if (current_line)
		$(current_line).after(line);
	    else
		this.source.append(line);
	},

	abcSource: function() {
	    var source = null;
	    this.state(function(st) {
		var prev, curr, next;
		curr = $(st.line);
		prev = curr.parents('.tune_line').prev().find('input');
		next = curr.parents('.tune_line').next().find('input');

		source = '';
		if (prev.length)
		    source += prev.val() + "|\n";
		source += curr.val();
		if (next.length)
		    source += "|\n" + next.val();
	    });

	    source = "K: "+this.key+"\n"+source;
	    return source;
	},

	drawSheet: function(force) {
	    this.state(function(st) {
		var source = this.abcSource();
		var sheet = this.sheet.children('.tune_canvas');
		if (!force && source == this._currently_rendered_source)
		    return;
		this._currently_rendered_source = source;
		if (!sheet[0])
		    this.sheet.append('<div class="tune_canvas" />');
		sheet = this.sheet.children('.tune_canvas')[0];
		ABCJS.renderAbc(sheet, source);
	    });
	},

	addNote: function(n) {
	    this.state(function(st) {
		st.line.value += n;
	    }, true);
	},

	replaceNote: function(n) {
	    this.state(function(st) {
		var line = st.line, note = st.note;
		line.value = line.value.substr(0, line.value.length-note.length)+n;
	    });
	},

	playNote: function() {
	    this.state(function(st) {
		var midinote, note = st.note;
		var notekey = note.match(/[A-Ga-g]/)[0];
		// This is an internal ABCJS API?
		var key = this.key.replace(/maj/i, '').replace(/min/i, 'm');
		var keysig = ABCJS.parse.parseKeyVoice.standardKey(key);

		var sharp, flat = false;
		for (var i=0; i < keysig.length; ++i) {
		    if (keysig[i].note.toLowerCase() == notekey.toLowerCase()
			&& keysig[i].acc == 'sharp') {
			sharp = true;
			break;
		    }
		}
		for (var i=0; i < keysig.length; ++i) {
		    if (keysig[i].note.toLowerCase() == notekey.toLowerCase()
			&& keysig[i].acc == 'flat') {
			flat = true;
			break;
		    }
		}

		if (note.match(/\^[A-Ga-g]/))
		    sharp = true;
		else if (note.match(/_[A-Ga-g]/))
		    flat = true;
		else if (note.match(/=[A-Ga-g]/))
		    sharp = flat = false;

		midinote = widget.noteToMidiOrd(note);

		if (sharp)
		    midinote += 1;
		if (flat)
		    midinote -= 1;

		MIDI.setVolume(0, 127);
		MIDI.noteOn(0, midinote, 127, 0);
		MIDI.noteOff(0, midinote, 0.75);
	    });
	},

	playAll: function() {
	    this.state(function() {
		var abc = this.abcSource();
		var midi_link = this.midi[0];

		ABCJS.renderMidi(midi_link, abc);

		var midi = $(midi_link).find('a').attr('href');
		var midi_data = midi.replace(/^data:audio\/midi,/, '');

		var hex, midi_binary = '';
		while (midi_data.length) {
		    if (midi_data[0] == '%') {
			hex = parseInt(midi_data.substr(1, 2), 16);
			midi_binary += String.fromCharCode(hex);
			midi_data = midi_data.substr(3);
		    }  else {
			midi_binary += midi_data[0];
			midi_data = midi_data.substr(1);
		    }
		}
		midi_data = 'data:audio/midi;base64,'+btoa(midi_binary);
		MIDI.Player.loadFile(midi_data);
		MIDI.Player.start();
	    });
	},

	chooseKeySignature: function() {
	    console.log('choose key signature / clef');
	},

	chooseTimeSignature: function() {
	    console.log('choose time signature / tempo');
	},

	insertNote: function(letter) {
	    // TODO: find closest letter to state().note and add it
	    var curr_ord, new_ord, st = this.state();
	    if (st.note) {
		curr_ord = widget.noteToOrd(st.note);
		new_ord = widget.noteToOrd(letter);
		if (Math.abs(new_ord - curr_ord) > 4) {
		    if (new_ord - curr_ord > 0)
			new_ord = curr_ord - (7 - (new_ord-curr_ord));
		    else
			new_ord = curr_ord + (7 + (new_ord-curr_ord));
		}
		this.addNote(widget.ordToNote(new_ord));
	    } else {
		this.addNote(letter);
	    }
	    this.playNote();
	},

	removeNote: function() {
	    this.replaceNote('');
	},

	makeTuplet: function(n) {
	    this.state(function(st) {
		var note = st.note;
		if (note.match(/\(\d/))
		    note = note.replace(/\(\d/, '');
		else
		    note = note.replace(/([_^=]?[A-Ga-g])/, '('+n+'$1');
		this.replaceNote(note);
	    });
	},

	changeValue: function(n) {
	    this.state(function(st) {
		if (n == 1) n = '';
		var note = st.note.replace(/([A-Ga-g][,']*)\d?/, function(_, p) {
		    return p+n;
		});
		this.replaceNote(note);
	    });
	},

	dot: function() {
	    this.state(function(st) {
		var note = st.note.
		    replace(/([A-Ga-g][,']*)(\d?)/, function(_, p, n) {
			switch(n) {
			case '2':
			    return p+'3';
			case '3':
			    return p+'2';
			case '4':
			    return p+'6';
			case '6':
			    return p+'4';
			case '8':
			    return p+'12';
			case '12':
			    return p+'8';
			case '':
			case '1':
			case '5':
			case '7':
			    console.log("i can't dot this!", st.note);
			    return _;
			}
			return p+n;
		    });
		this.replaceNote(note);
	    });
	},

	breakBeam: function() {
	    this.state(function(st) {
		if (st.note.match(/[^|]\s$/))
		    this.replaceNote(st.note.replace('\s+', ''));
		else if (st.note.match(/\S$/))
		    this.replaceNote(st.note + ' ');
	    });
	},

	breakMeasure: function() {
	    this.state(function(st) {
		if (st.note.match(/\|\s*$/))
		    this.replaceNote(st.note.replace(/\|\s*$/, ''));
		else
		    this.replaceNote(st.note.replace(/\s+$/, '')+' | ');
	    });
	},

	breakStaff: function() {
	    this.state(function(st) {
		this.addStaffLine();
	    });
	},

	flatten: function() {
	    this.state(function(st) {
		if (st.note.match(/_[A-Ga-g]/))
		    this.replaceNote(st.note.replace(/_([A-Ga-g])/, '$1'));
		else
		    this.replaceNote(st.note.replace(/[=^]*([A-Ga-g])/, '_$1'));
		this.playNote();
	    });
	},

	sharpen: function() {
	    this.state(function(st) {
		if (st.note.match(/\^[A-Ga-g]/))
		    this.replaceNote(st.note.replace(/\^([A-Ga-g])/, '$1'));
		else
		    this.replaceNote(st.note.replace(/[=_]*([A-Ga-g])/, '^$1'));
		this.playNote();
	    });
	},

	naturalize: function() {
	    this.state(function(st) {
		if (st.note.match(/=[A-Ga-g]/))
		    this.replaceNote(st.note.replace(/=([A-Ga-g])/, '$1'));
		else
		    this.replaceNote(st.note.replace(/[_^]*([A-Ga-g])/, '=$1'));
		this.playNote();
	    });
	},

	swing: function() {
	    this.state(function(st) {
		if (st.note.match(/[A-Ga-g][,']*\s*>/))
		    this.replaceNote(st.note.replace(/([A-Ga-g][,']*\s*)>/, '$1'));
		else
		    this.replaceNote(st.note.replace(/([A-Ga-g][,']*\s*)/, '$1>'));
	    });
	},

	translate: function(interval) {
	    this.state(function(st) {
		var key = st.note.match(/([A-Ga-g][,']*)/)[1];
		var ord = widget.noteToOrd(key);
		if (interval < 0)
		    interval += 1;
		else
		    interval -= 1;
		key = widget.ordToNote(ord + interval);
		this.replaceNote(st.note.replace(/[A-Ga-g][,']*/, key));
		this.playNote();
	    });
	}
    };


    $('.tune_widget').each(function() {
	var self = this;
	var widg = new widget(this);

	widg.addStaffLine();
	setInterval(function(){ widg.drawSheet() }, 100);

	$(window).on('keydown.tune_widget', function(e) {
	    if (e.target != $('body')[0] && !$(e.target).is('.options'))
		return;

	    var key = String.fromCharCode(e.which).toLowerCase();
	    switch(key) {
	    case 'o':
		widg.toggleOptions();
		return e.preventDefault();
	    case 'p':
		if (e.shiftKey)
		    widg.playNote();
		else
		    widg.playAll();
		return e.preventDefault();
	    case 'a':
	    case 'b':
	    case 'c':
	    case 'd':
	    case 'e':
	    case 'f':
	    case 'g':
		widg.insertNote(e.shiftKey ? key : key.toUpperCase());
		return e.preventDefault();
	    case '1':
	    case '2':
	    case '3':
	    case '4':
	    case '6':
	    case '8':
		if (e.shiftKey)
		    widg.makeTuplet(parseInt(key));
		else
		    widg.changeValue(parseInt(key));
		return e.preventDefault();
	    }

	    switch(e.which){
	    case 8:
		// Backspace
		widg.removeNote();
		return e.preventDefault();
	    case 32:
		// Space
		widg.breakBeam();
		return e.preventDefault();
	    case 220:
		// |
		if (e.shiftKey)
		    widg.breakMeasure();
		return e.preventDefault();
	    case 13:
		// Return
		widg.breakStaff();
		return e.preventDefault();
	    case 189:
		// _
		widg.flatten();
		return e.preventDefault();
	    case 187:
		// + / =
		if (e.shiftKey)
		    widg.sharpen();
		else
		    widg.naturalize();
		return e.preventDefault();
	    case 190:
		// > / .
		if (e.shiftKey)
		    widg.swing();
		else
		    widg.dot();
		return e.preventDefault();
	    case 38:
	    case 40:
		// [Meta] DOWN, [Meta] UP
		if (e.metaKey)
		    widg.translate(e.which == 38 ? 8 : -8);
		else
		    widg.translate(e.which == 38 ? 2 : -2);
		return e.preventDefault();
	    }
	});
    });
});
