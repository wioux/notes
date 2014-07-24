
function ABCLineParser(source) {
    this.source = source;
    this.consumeDecorations();
}

ABCLineParser.prototype = {
    lookAhead: function() {
        this.source = this.source.replace(/^\s+/, '');
        return this.source[0];
    },

    consumeAccidentals: function() {
        var acc = this.accidentals || null;
        this.accidentals = null;
        return acc;
    },

    consumeDecorations: function() {
        var dec = this.decorations || {};
        this.decorations = {};
        return dec;
    },

    parseNoteValue: function() {
        // TODO broken rhythm
        // TODO tuplets
        // TODO error checking on the value (e.g. what would /9 mean?)
        var m = this.source.match(/^[1-9]?\/?[1-9]/);
        if (m)
            this.source = this.source.substr(m[0].length);
        return m ? m[0] : '1';
    },

    beginSlur: function() {
        this.slur = (this.slur || 0) + 1;
    },

    endSlur: function() {
        this.slur = (this.slur || 0) - 1;
        if (this.slur < 0)
            throw 'Slur begin / end mismatch';
    },

    beginGrace: function() {
        if (this.grace)
            throw 'Grace note brackets cannot be nested';
        this.grace = true;
    },

    endGrace: function() {
        if (!this.grace)
            throw 'Grace note begin / end mismatch';
        this.grace = false;
    },

    beginChord: function() {
        if (this.chord)
            throw 'Chord brackets cannot be nested';
        this.chord = true;
    },

    endChord: function() {
        if (!this.chord)
            throw 'Chord begin / end mismatch';
        this.chord = false;
    },

    parse: function() {
        var unit, prev = null;
        var types = [].slice.call(arguments);

        var begin = 0;
        var src = this.source;
        this.results = [];
        while (this.source.match(/\S/)) {
            begin += this.source.match(/^\s*/)[0].length;
            this.source = this.source.replace(/^\s+/, '');

            unit = this.parseUnit();
            unit.col = begin;
            unit.source = src.substr(begin, src.length-this.source.length-begin);
            begin += unit.source.length;

            if (prev)
                prev.next = unit;
            unit.prev = prev;
            prev = unit;

            this.results.push(unit);
        }

        var results = [];
        for (var i=0; i < this.results.length; ++i)
            if (!types.length || types.indexOf(this.results[i].type) != -1)
                results.push(this.results[i]);
        return results;
    },

    parseUnit: function() {
        var token, shift, swing, beam, value, tie, accidental, decorations;
        token = this.lookAhead();

        switch(token.toLowerCase()) {
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'e':
        case 'f':
        case 'g':
            accidental = this.consumeAccidentals();
            decorations = this.consumeDecorations();
            this.source = this.source.substr(1);

            shift = 0;
            while (this.source[0] == "'" || this.source[0] == ',') {
                shift += (this.source[0]=="'" ? 1 : -1)
                this.source = this.source.substr(1);
            }

            value = this.parseNoteValue();

            beam = !this.source.match(/^\s/);
            this.source = this.source.replace(/^\s+/, '');

            swing = this.source.match(/^[><]/);
            swing = swing && swing[0];
            this.source = this.source.replace(/^[><]/, '');

            tie = !!this.source.match(/^-/);
            this.source = this.source.replace(/^-/, '');

            return {
                type: 'note',
                pitch: token,
                octave_shift: shift,
                value: value,
                accidentals: accidental || '',
                decorations: decorations,
                swing: swing,
                tie: tie,
                beam: beam,

                computedSource: function() {
                    var src = '';
                    for (var key in this.decorations)
                        src += this.decorations[key];

                    src += this.accidentals;

                    src += this.pitch;
                    while (this.octave_shift > 0) {
                        src += "'";
                        this.octave_shift--;
                    }
                    while (this.octave_shift < 0) {
                        src += ",";
                        this.octave_shift++;
                    }

                    src += (this.value == '1' ? '' : this.value);

                    if (this.swing)
                        src += this.swing;
                    if (!this.beam)
                        src += ' ';
                    if (this.tie)
                        src += '-';

                    return src;
                }
            };

        case '^':
        case '_':
        case '=':
            this.source = this.source.replace(/^./, '');
            this.accidentals = (this.accidentals || '') + token;
            return this.parseUnit();

        case '.':
        case '~':
        case 'h':
        case 'l':
        case 'm':
        case 'p':
        case 't':
        case 'u':
        case 'v':
            // TODO support !trill! notation
            this.source = this.source.replace(/^./, '');
            this.decorations[
                {
                    '.': 'staccato', '~': 'roll', 'h': 'fermata',
                    'l': 'accent', 'm': 'lower_mordent', 'p': 'upper_mordent',
                    't': 'trill', 'u': 'up_bow', 'v': 'down_bow'
                }[token.toLowerCase()]
            ] = token;
            return this.parseUnit();

        case 'z':
        case 'x':
            // TODO support multi-measure rests
            // TODO accidental check should also check decorations
            accidental = this.consumeAccidentals();
            if (accidental)
                throw "Rests cannot be preceded by an accidental";

            this.source = this.source.replace(/^./, '');
            value = this.parseNoteValue();

            return {
                type: 'rest',
                value: value
            };

        case '|':
            accidental = this.consumeAccidentals();
            if (accidental)
                throw "Bar lines cannot be preceded by an accidental";

            this.source = this.source.replace(/^./, '');

            if (this.source[0] == ':') {
                this.source = this.source.replace(/^./, '');
                return { type: 'repeat_begin', bar: true };
            } else if (this.source.match(/^(\d)|(\s*\[\d)/)) {
                this.source = this.source.replace(/^(\d)|(\s*\[\d)/, '');
                return { type: 'nth_ending_begin', bar: true };
            } else {
                return { type: 'bar', bar: true };
            }

        case ':':
            accidental = this.consumeAccidentals();
            if (accidental)
                throw "Bar lines cannot be preceded by an accidental";

            this.source = this.source.replace(/^./, '');

            if (this.source[0] == '|') {
                this.source = this.source.replace(/^./, '');
                if (this.source.match(/^(\d)|(\s*\[\d)/)) {
                    this.source = this.source.replace(/^(\d)|(\s*\[\d)/, '');
                    return { type: 'nth_ending_begin', bar: true };
                } else {
                    return { type: 'repeat_end', bar: true };
                }
            } else {
                throw 'Expectedd pipe (|) after colon';
            }

        case '(':
            accidental = this.consumeAccidentals();
            this.source = this.source.replace(/^./, '');

            if (this.source.match(/^\d/)) {
                value = parseInt(this.source.match(/^\d/)[0]);
                this.source = this.source.replace(/^\d/, '');

                if (accidental)
                    throw 'Tuplet cannot be preceded by an accidental';

                return { type: 'tuplet_begin', value: value };
            } else {
                if (accidental)
                    throw 'Slur cannot be preceded by an accidental';

                this.beginSlur();

                return { type: 'slur_begin' };
            }

        case ')':
            accidental = this.consumeAccidentals();
            this.source = this.source.replace(/^./, '');

            if (accidental)
                throw 'Slur ends cannot be preceded by an accidental';

            this.endSlur();

            return { type: 'slur_end' };

        case '{':
            accidental = this.consumeAccidentals();
            this.source = this.source.replace(/^./, '');

            if (accidental)
                throw 'Grace note bracket preceded by accidental';

            this.beginGrace();

            return { type: 'grace_begin' };

        case '}':
            accidental = this.consumeAccidentals();
            this.source = this.source.replace(/^./, '');

            if (accidental)
                throw 'Grace note bracket preceded by accidental';

            this.endGrace();

            return { type: 'grace_end' };

        case '[':
            // TODO beamed/tied chords?
            // NOTE chord decorations are attached to its first note
            accidental = this.consumeAccidentals();
            this.source = this.source.replace(/^./, '');

            if (accidental)
                throw 'Chord bracket preceded by accidental';

            this.beginChord();

            return { type: 'chord_begin' };

        case ']':
            accidental = this.consumeAccidentals();
            this.source = this.source.replace(/^./, '');

            if (accidental)
                throw 'Chord bracket preceded by accidental';

            this.endChord();

            return { type: 'chord_end' };

        case '"':
            this.source = this.source.substr(1);
            if (!(this.source[0] || '').match(/[_<>^]/))
                throw "Expected one of _<>^ after annotation quote";

            value = this.source.match(/[_<>^][^"]+"/)
            if (!value)
                throw "Invalid annotation string";
            this.source = this.source.substr(value[0].length);

            return { type: 'annotation', value: value[0] };

        default:
            throw 'Unexpected token: '+token;
        }
    }
};
