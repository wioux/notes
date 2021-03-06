
// TODO:
//   * For midi numbers, previous accidentals in the measure must be considered

$(document).ready(function() {
    function widget(container) {
        var widg = this;
        var source = $('<div class="tune_source"></div>');
        var sheet = $('<div class="tune_sheet"></div>');
        var midi = $('<div class="midi"></div>');
        var metronome = $('<div class="metronome"></div>');
        $(container).addClass('tune_widget').append(source, sheet, midi, metronome);

        source.on('click', '.tune_line', function() {
            widg.selectStaffLine(this);
        });

        this.container = $(container);
        this.source = source;
        this.sheet = sheet;
        this.midi = midi;
        this.metronome = metronome;

        this.time = '4/4';
        this.tempo = '120';
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
                        btns.append($('<span class="btn btn-default btn-xs">').
                                    text(keysigs[i][0]));
                        btns.append($('<span class="btn btn-default btn-xs">').
                                    text(keysigs[i][1]));
                        sig.append(btns);

                        sig.find('.btn').click(function() {
                            widget.key = $(this).text();
                            modal.find('.btn').removeClass('active');
                            $(this).addClass('active');
                        }).filter(function() {
                            return this.innerText == widget.key;
                        }).addClass('active');
                        tr.append(sig);
                    };

                    table = $('<table/>');
                    pane.append('<h3>Time / Tempo</h3>', table);
                    table.append($('<tr><td>Tempo</td><td><input name="tempo"/>'));
                    table.append($('<tr><td>Time</td><td><input name="time"/>'));
                    table.find('td').css('padding-right', 15);
                    table.find('input').css('width', 40).val(function() {
                        return widget[$(this).attr('name')];
                    }).keyup(function() {
                        widget[$(this).attr('name')] = $(this).val();
                    });


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

        showAbcSource: function() {
            var abc = this.abcSource();
            var modal = $('<div tabindex="-1"/>').addClass('modal');
            var pane = $('<div/>').addClass('modal-body');
            pane.css('white-space', 'pre');
            pane.text(abc);
            modal.append(pane).modal();
        },

        enterRhythmMode: function() {
            var bpm = this.bpm() / 2;
            var metronome = this.metronome;

            this.metronome_beep = setInterval(function() {
                MIDI.setVolume(0, 127);
                MIDI.noteOn(0, 70, 127, 0);
                MIDI.noteOff(0, 70, 0.1);

                metronome.addClass('blip');
                setTimeout(function() {
                    metronome.removeClass('blip');
                }, 100);
            }, 60*1000 / bpm);

            var m, tlast = null, tnow = null;
            $(window).on('keydown.rhythm_mode', function(e) {
                // TODO: this assumes unit value = 1/8
                tnow = new Date().getTime();
                if (e.widget && tlast) {
                    e.widget.state(function(st) {
                        var note = st.note, line = st.line;
                        var prev = note.prev || {};

                        if (prev.type != 'note')
                            return;

                        m = 2 * (tnow - tlast) / (1000 * 60 / bpm);
                        var om = m;
                        m = Math.max(Math.round(2 * m) / 2, 0.5);
                        if (m == Math.floor(m))
                            prev.value = ''+m;
                        else if (m == 0.5)
                            prev.value = '/2';
                        else
                            prev.value = Math.floor(2*m)+'/2';
                        prev.beam = false;

                        line.value = line.value.substr(0, prev.col) +
                            prev.computedSource() +
                            line.value.substr(note.col);
                    });
                }
                tlast = tnow;
            });

            this.rhythmMode = true;
        },

        exitRhythmMode: function() {
            clearInterval(this.metronome_beep);
            $(window).off('keydown.rhythm_mode');

            this.rhythmMode = false;
        },

        nextNote: function() {
            this.state(function(st) {
                if (st.note.next) {
                    var b = st.line.value.substr(0, st.note.next.col);
                    var a = st.line.value.substr(st.note.next.col);
                    var v = b.replace('"^_"', '') + '"^_"' + a;
                    st.line.value = v;
                } else {
                    st.line.value = st.line.value.replace('"^_"', '');
                }
                this.playNote();
            });
        },

        prevNote: function() {
            this.state(function(st) {
                if (st.note.prev) {
                    var b = st.line.value.substr(0, st.note.prev.col);
                    var a = st.line.value.substr(st.note.prev.col);
                    var v = b + '"^_"' + a.replace('"^_"', '');
                    st.line.value = v;
                } else {
                    console.log("No prev note: ", st.note);
                }
                this.playNote();
            });
        },

        state: function(f, call_with_no_note) {
            var state = {},
                note = null,
                line = this.source.find('.tune_line.active input');

            if (line[0]) {
                var p = new ABCLineParser(line[0].value);
                var stuff = p.parse('annotation', 'note');
                var marker = stuff.filter(function(x) {
                    return x.type == 'annotation' && x.source == '"^_"';
                })[0];
                if (marker && marker.next) {
                    note = marker.next;
                    note.prev = marker.prev;
                } else {
                    note = stuff[stuff.length-1];
                }
                note = note || null;
                state.marker = marker;
            }

            state.line = line[0];
            state.note = note;

            if ((state.note || call_with_no_note) && typeof f == 'function')
                f.call(this, state);

            return state;
        },

        addStaffLine: function() {
            var current_line = this.source.find('.tune_line.active')[0];
            var line = $('<div class="tune_line active"></div>').html('<input/>');

            if (current_line)
                $(current_line).after(line);
            else
                this.source.append(line);

            this.selectStaffLine(line);
        },

        selectStaffLine: function(line) {
            this.source.find('.tune_line.active').removeClass('active');
            this.source.find('.tune_line.visible').removeClass('visible');

            $(line).addClass('active');
            $(line).prev().addClass('visible');

            this.source[0].scrollTop = this.source[0].scrollHeight;
        },

        abcSource: function(startAtCursor) {
            var source = null;
            this.state(function(st) {
                var ind;
                var lines = this.source.find('.visible input, .active input');
                source = lines.map(function() {
                    if ($(this).parents('.active')[0])
                        return this.value;
                    else
                        return this.value.replace('"^_"', '');
                });
                source = source.get().join("|\n");

                if (startAtCursor && (ind = source.indexOf('"^_"')))
                    source = source.substr(ind);
            });

            source = ["K: "+this.key,
                      "M: "+this.time,
                      "Q: "+this.tempo].
                join("\n")+"\n"+source;

            return source;
        },

        bpm: function() {
            return parseInt(this.tempo);
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
                if (st.marker) {
                    var line = st.line.value;
                    var b = line.substr(0, st.note.next.col);
                    var a = line.substr(st.note.next.col);
                    st.line.value = b + n + a;
                    this.nextNote();
                } else {
                    st.line.value += n;
                }
            }, true);
        },

        replaceNote: function(n) {
            this.state(function(st) {
                var line = st.line, note = st.note;
                var b = line.value.substr(0, note.col);
                var a = line.value.substr(note.col+note.source.length);
                if (typeof n == 'string')
                    line.value = b + n + a;
                else
                    line.value = b + n.computedSource() + a;
            });
        },

        playNote: function() {
            if (MIDI.Player.playing)
                return;

            this.state(function(st) {
                var midinote, note = st.note;
                if (note.type != 'note')
                    return;
                var notekey = note.pitch;
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

                if (note.accidentals.match(/\^/))
                    sharp = true;
                else if (note.accidentals.match(/_/))
                    flat = true;
                else if (note.accidentals.match(/=/))
                    sharp = flat = false;

                midinote = widget.noteToMidiOrd(note.source);

                if (sharp)
                    midinote += 1;
                if (flat)
                    midinote -= 1;

                MIDI.setVolume(0, 127);
                MIDI.noteOn(0, midinote, 127, 0);
                MIDI.noteOff(0, midinote, 0.75);
            });
        },

        playAbc: function(abc) {
            if (MIDI.Player.playing)
                return MIDI.Player.stop();

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
            MIDI.Player.addListener(function(data) {
                if (data.now >= data.end)
                    MIDI.Player.stop();
            });
            MIDI.Player.start();
        },

        playFromCursor: function() {
            this.state(function() {
                this.playAbc(this.abcSource(true));
            });
        },

        playAll: function() {
            this.state(function() {
                this.playAbc(this.abcSource());
            });
        },

        chooseKeySignature: function() {
            console.log('choose key signature / clef');
        },

        chooseTimeSignature: function() {
            console.log('choose time signature / tempo');
        },

        insertNote: function(letter) {
            var curr_ord, new_ord, st = this.state();
            if (st.note) {
                curr_ord = widget.noteToOrd(st.note.source);
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

            return this.state().note;
        },

        removeNote: function() {
            this.replaceNote('');
        },

        makeTuplet: function(n) {
            this.state(function(st) {
                var note = st.note, line = st.line;
                if (note.type != 'note' && note.type != 'rest')
                    return;
                if (note.prev && note.prev.type == 'tuplet_begin') {
                    line.value = line.value.substr(0, note.prev.col) +
                        line.value.substr(note.col);
                } else {
                    line.value = line.value.substr(0, note.col) +
                        ('('+n) + line.value.substr(note.col);
                    this.nextNote(); // otherwise the tuplet_begin gets marked
                }
            });
        },

        changeValue: function(n) {
            this.state(function(st) {
                st.note.value = (n == 1 ? '' : n);
                this.replaceNote(st.note);
            });
        },

        dot: function() {
            this.state(function(st) {
                switch(st.note.value) {
                case '2':
                    st.note.value = '3';
                    break;
                case '3':
                    st.note.value = '2';
                    break;
                case '4':
                    st.note.value = '6';
                    break;
                case '6':
                    st.note.value = '4';
                    break;
                case '8':
                    st.note.value = '12';
                    break;
                case '12':
                    st.note.value = '8';
                    break;
                case '':
                case '1':
                case '5':
                case '7':
                    console.log("i can't dot this!", note);
                    break;
                }
                this.replaceNote(st.note);
            });
        },

        breakBeam: function() {
            this.state(function(st) {
                st.note.beam = !st.note.beam;
                this.replaceNote(st.note);
            });
        },

        breakMeasure: function() {
            this.state(function(st) {
                var line = st.line;
                var note = st.note;
                var b, a;
                if (note.next && note.next.bar) {
                    b = line.value.substr(0, note.next.col);
                    a = line.value.substr(note.next.col+note.next.source.length);
                } else {
                    b = line.value.substr(0, note.col+note.source.length);
                    a = line.value.substr(note.col+note.source.length);
                    b = b.replace(/\s+$/, '') + ' | ';
                    a = a.replace(/^\s+/, '');
                }
                line.value = b + a;
            });
        },

        breakStaff: function() {
            this.state(function(st) {
                this.addStaffLine();
            });
        },

        flatten: function() {
            this.state(function(st) {
                if (st.note.accidentals.match(/_/))
                    st.note.accidentals = '';
                else
                    st.note.accidentals = '_';
                this.replaceNote(st.note);
                this.playNote();
            });
        },

        sharpen: function() {
            this.state(function(st) {
                if (st.note.accidentals.match(/\^/))
                    st.note.accidentals = '';
                else
                    st.note.accidentals = '^';
                this.replaceNote(st.note);
                this.playNote();
            });
        },

        naturalize: function() {
            this.state(function(st) {
                if (st.note.accidentals.match(/=/))
                    st.note.accidentals = '';
                else
                    st.note.accidentals = '=';
                this.replaceNote(st.note);
                this.playNote();
            });
        },

        swing: function(direction) {
            this.state(function(st) {
                if (st.note.swing == direction)
                    st.note.swing = null;
                else
                    st.note.swing = direction;
                this.replaceNote(st.note);
            });
        },

        translate: function(interval) {
            this.state(function(st) {
                var key = st.note.source.match(/([A-Ga-g][,']*)/)[1];
                var ord = widget.noteToOrd(key);
                if (interval < 0)
                    interval += 1;
                else
                    interval -= 1;
                key = widget.ordToNote(ord + interval);
                this.replaceNote(st.note.source.replace(/[A-Ga-g][,']*/, key));
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
            if (e.target != $('body')[0])
                return;

            e.widget = widg;

            var key = String.fromCharCode(e.which).toLowerCase();
            switch(key) {
            case 'o':
                widg.toggleOptions();
                return e.preventDefault();
            case 's':
                widg.showAbcSource();
                return e.preventDefault();
            case 'r':
                if (e.shiftKey || e.ctrlKey || e.metaKey)
                    return;
                if (widg.rhythmMode)
                    widg.exitRhythmMode();
                else
                    widg.enterRhythmMode();
                return e.preventDefault();
            case 'p':
                if (e.ctrlKey)
                    widg.playNote();
                else if (e.shiftKey)
                    widg.playFromCursor();
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
                e.note = widg.insertNote(e.shiftKey ? key : key.toUpperCase());
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
            case 188:
            case 190:
                // < / > / .
                if (e.shiftKey)
                    widg.swing(e.which == 188 ? '<' : '>');
                else if (e.which == 190)
                    widg.dot();
                return e.preventDefault();
            case 37:
            case 39:
                widg[(e.which == 37 ? 'prev' : 'next')+'Note']();
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
