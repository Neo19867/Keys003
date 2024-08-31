
// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
// https://github.com/kripken/emscripten/issues/5820
// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
// which is able to be used/called before the WASM is loaded.
// The modularization below exports a promise that loads and resolves to the actual sql.js module.
// That way, this module can't be used before the WASM is finished loading.

// We are going to define a function that a user will call to start loading initializing our Sql.js library
// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
// Instead, we want to return the previously loaded module

// TODO: Make this not declare a global if used in the browser
var initSqlJsPromise = undefined;

var initSqlJs = function (moduleConfig) {

    if (initSqlJsPromise){
      return initSqlJsPromise;
    }
    // If we're here, we've never called this function before
    initSqlJsPromise = new Promise(function (resolveModule, reject) {

        // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
        // https://github.com/kripken/emscripten/issues/5820

        // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
        // properties to it, like `preRun`, `postRun`, etc
        // We are using that to get notified when the WASM has finished loading.
        // Only then will we return our promise

        // If they passed in a moduleConfig object, use that
        // Otherwise, initialize Module to the empty object
        var Module = typeof moduleConfig !== 'undefined' ? moduleConfig : {};

        // EMCC only allows for a single onAbort function (not an array of functions)
        // So if the user defined their own onAbort function, we remember it and call it
        var originalOnAbortFunction = Module['onAbort'];
        Module['onAbort'] = function (errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction){
              originalOnAbortFunction(errorThatCausedAbort);
            }
        };

        Module['postRun'] = Module['postRun'] || [];
        Module['postRun'].push(function () {
            // When Emscripted calls postRun, this promise resolves with the built Module
            resolveModule(Module);
        });

        // There is a section of code in the emcc-generated code below that looks like this:
        // (Note that this is lowercase `module`)
        // if (typeof module !== 'undefined') {
        //     module['exports'] = Module;
        // }
        // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
        // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
        // but that carries with it additional unnecessary baggage/bugs we don't want either.
        // So, we have three options:
        // 1) We undefine `module`
        // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
        // 3) We write a script to remove those lines of code as part of the Make process.
        //
        // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
        // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
        // That's a nice side effect since we're handling the modularization efforts ourselves
        module = undefined;

        // The emcc-generated code and shell-post.js code goes below,
        // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort

var e;e||(e=typeof Module !== 'undefined' ? Module : {});null;
e.onRuntimeInitialized=function(){function a(h,l){this.Pa=h;this.db=l;this.Oa=1;this.gb=[]}function b(h){this.filename="dbfile_"+(4294967295*Math.random()>>>0);if(null!=h){var l=this.filename,r=l?k("//"+l):"/";l=aa(!0,!0);r=ba(r,(void 0!==l?l:438)&4095|32768,0);if(h){if("string"===typeof h){for(var q=Array(h.length),A=0,da=h.length;A<da;++A)q[A]=h.charCodeAt(A);h=q}ca(r,l|146);q=m(r,"w");fa(q,h,0,h.length,0,void 0);ja(q);ca(r,l)}}this.handleError(f(this.filename,c));this.db=p(c,"i32");mc(this.db);
this.eb={};this.Va={}}var c=u(4),d=e.cwrap,f=d("sqlite3_open","number",["string","number"]),g=d("sqlite3_close_v2","number",["number"]),n=d("sqlite3_exec","number",["number","string","number","number","number"]),t=d("sqlite3_changes","number",["number"]),w=d("sqlite3_prepare_v2","number",["number","string","number","number","number"]),v=d("sqlite3_prepare_v2","number",["number","number","number","number","number"]),B=d("sqlite3_bind_text","number",["number","number","number","number","number"]),H=
d("sqlite3_bind_blob","number",["number","number","number","number","number"]),ea=d("sqlite3_bind_double","number",["number","number","number"]),nc=d("sqlite3_bind_int","number",["number","number","number"]),oc=d("sqlite3_bind_parameter_index","number",["number","string"]),pc=d("sqlite3_step","number",["number"]),qc=d("sqlite3_errmsg","string",["number"]),rc=d("sqlite3_column_count","number",["number"]),sc=d("sqlite3_data_count","number",["number"]),tc=d("sqlite3_column_double","number",["number",
"number"]),uc=d("sqlite3_column_text","string",["number","number"]),vc=d("sqlite3_column_blob","number",["number","number"]),wc=d("sqlite3_column_bytes","number",["number","number"]),xc=d("sqlite3_column_type","number",["number","number"]),yc=d("sqlite3_column_name","string",["number","number"]),zc=d("sqlite3_reset","number",["number"]),Ac=d("sqlite3_clear_bindings","number",["number"]),Bc=d("sqlite3_finalize","number",["number"]),Cc=d("sqlite3_create_function_v2","number","number string number number number number number number number".split(" ")),
Dc=d("sqlite3_value_type","number",["number"]),Ec=d("sqlite3_value_bytes","number",["number"]),Fc=d("sqlite3_value_text","string",["number"]),Gc=d("sqlite3_value_blob","number",["number"]),Hc=d("sqlite3_value_double","number",["number"]),Ic=d("sqlite3_result_double","",["number","number"]),pb=d("sqlite3_result_null","",["number"]),Jc=d("sqlite3_result_text","",["number","string","number","number"]),Kc=d("sqlite3_result_blob","",["number","number","number","number"]),Lc=d("sqlite3_result_int","",["number",
"number"]),qb=d("sqlite3_result_error","",["number","string","number"]),mc=d("RegisterExtensionFunctions","number",["number"]);a.prototype.bind=function(h){if(!this.Pa)throw"Statement closed";this.reset();return Array.isArray(h)?this.ub(h):null!=h&&"object"===typeof h?this.vb(h):!0};a.prototype.step=function(){if(!this.Pa)throw"Statement closed";this.Oa=1;var h=pc(this.Pa);switch(h){case 100:return!0;case 101:return!1;default:throw this.db.handleError(h);}};a.prototype.Bb=function(h){null==h&&(h=
this.Oa,this.Oa+=1);return tc(this.Pa,h)};a.prototype.Cb=function(h){null==h&&(h=this.Oa,this.Oa+=1);return uc(this.Pa,h)};a.prototype.getBlob=function(h){null==h&&(h=this.Oa,this.Oa+=1);var l=wc(this.Pa,h);h=vc(this.Pa,h);for(var r=new Uint8Array(l),q=0;q<l;)r[q]=x[h+q],q+=1;return r};a.prototype.get=function(h){null!=h&&this.bind(h)&&this.step();h=[];for(var l=0,r=sc(this.Pa);l<r;){switch(xc(this.Pa,l)){case 1:case 2:h.push(this.Bb(l));break;case 3:h.push(this.Cb(l));break;case 4:h.push(this.getBlob(l));
break;default:h.push(null)}l+=1}return h};a.prototype.getColumnNames=function(){for(var h=[],l=0,r=rc(this.Pa);l<r;)h.push(yc(this.Pa,l)),l+=1;return h};a.prototype.getAsObject=function(h){h=this.get(h);for(var l=this.getColumnNames(),r={},q=0,A=l.length;q<A;)r[l[q]]=h[q],q+=1;return r};a.prototype.run=function(h){null!=h&&this.bind(h);this.step();return this.reset()};a.prototype.yb=function(h,l){null==l&&(l=this.Oa,this.Oa+=1);h=ka(h);var r=la(h);this.gb.push(r);this.db.handleError(B(this.Pa,l,r,
h.length-1,0))};a.prototype.tb=function(h,l){null==l&&(l=this.Oa,this.Oa+=1);var r=la(h);this.gb.push(r);this.db.handleError(H(this.Pa,l,r,h.length,0))};a.prototype.xb=function(h,l){null==l&&(l=this.Oa,this.Oa+=1);this.db.handleError((h===(h|0)?nc:ea)(this.Pa,l,h))};a.prototype.wb=function(h){null==h&&(h=this.Oa,this.Oa+=1);H(this.Pa,h,0,0,0)};a.prototype.mb=function(h,l){null==l&&(l=this.Oa,this.Oa+=1);switch(typeof h){case "string":this.yb(h,l);return;case "number":case "boolean":this.xb(h+0,l);
return;case "object":if(null===h){this.wb(l);return}if(null!=h.length){this.tb(h,l);return}}throw"Wrong API use : tried to bind a value of an unknown type ("+h+").";};a.prototype.vb=function(h){var l=this;Object.keys(h).forEach(function(r){var q=oc(l.Pa,r);0!==q&&l.mb(h[r],q)});return!0};a.prototype.ub=function(h){for(var l=0;l<h.length;)this.mb(h[l],l+1),l+=1;return!0};a.prototype.reset=function(){return 0===Ac(this.Pa)&&0===zc(this.Pa)};a.prototype.freemem=function(){for(var h;void 0!==(h=this.gb.pop());)ma(h)};
a.prototype.free=function(){var h=0===Bc(this.Pa);delete this.db.eb[this.Pa];this.Pa=0;return h};b.prototype.run=function(h,l){if(!this.db)throw"Database closed";if(l){h=this.prepare(h,l);try{h.step()}finally{h.free()}}else this.handleError(n(this.db,h,0,0,c));return this};b.prototype.exec=function(h,l){if(!this.db)throw"Database closed";var r=na(),q=null;try{var A=oa(h)+1,da=u(A);pa(h,x,da,A);var D=da;var ha=u(4);for(h=[];0!==p(D,"i8");){qa(c);qa(ha);this.handleError(v(this.db,D,-1,c,ha));var ia=
p(c,"i32");D=p(ha,"i32");if(0!==ia){A=null;q=new a(ia,this);for(null!=l&&q.bind(l);q.step();)null===A&&(A={columns:q.getColumnNames(),values:[]},h.push(A)),A.values.push(q.get());q.free()}}return h}catch(E){throw q&&q.free(),E;}finally{ra(r)}};b.prototype.each=function(h,l,r,q){"function"===typeof l&&(q=r,r=l,l=void 0);h=this.prepare(h,l);try{for(;h.step();)r(h.getAsObject())}finally{h.free()}if("function"===typeof q)return q()};b.prototype.prepare=function(h,l){qa(c);this.handleError(w(this.db,h,
-1,c,0));h=p(c,"i32");if(0===h)throw"Nothing to prepare";var r=new a(h,this);null!=l&&r.bind(l);return this.eb[h]=r};b.prototype["export"]=function(){Object.values(this.eb).forEach(function(l){l.free()});Object.values(this.Va).forEach(sa);this.Va={};this.handleError(g(this.db));var h=ta(this.filename);this.handleError(f(this.filename,c));this.db=p(c,"i32");return h};b.prototype.close=function(){null!==this.db&&(Object.values(this.eb).forEach(function(h){h.free()}),Object.values(this.Va).forEach(sa),
this.Va={},this.handleError(g(this.db)),ua("/"+this.filename),this.db=null)};b.prototype.handleError=function(h){if(0===h)return null;h=qc(this.db);throw Error(h);};b.prototype.getRowsModified=function(){return t(this.db)};b.prototype.create_function=function(h,l){Object.prototype.hasOwnProperty.call(this.Va,h)&&(va(this.Va[h]),delete this.Va[h]);var r=wa(function(q,A,da){for(var D,ha=[],ia=0;ia<A;ia+=1){var E=p(da+4*ia,"i32"),P=Dc(E);if(1===P||2===P)E=Hc(E);else if(3===P)E=Fc(E);else if(4===P){P=
E;E=Ec(P);P=Gc(P);for(var vb=new Uint8Array(E),Ca=0;Ca<E;Ca+=1)vb[Ca]=x[P+Ca];E=vb}else E=null;ha.push(E)}try{D=l.apply(null,ha)}catch(Oc){qb(q,Oc,-1);return}switch(typeof D){case "boolean":Lc(q,D?1:0);break;case "number":Ic(q,D);break;case "string":Jc(q,D,-1,-1);break;case "object":null===D?pb(q):null!=D.length?(A=la(D),Kc(q,A,D.length,-1),ma(A)):qb(q,"Wrong API use : tried to return a value of an unknown type ("+D+").",-1);break;default:pb(q)}});this.Va[h]=r;this.handleError(Cc(this.db,h,l.length,
1,0,r,0,0,0));return this};e.Database=b};var xa={},y;for(y in e)e.hasOwnProperty(y)&&(xa[y]=e[y]);var ya="./this.program",za=!1,z=!1,Aa=!1,Ba=!1;za="object"===typeof window;z="function"===typeof importScripts;Aa="object"===typeof process&&"object"===typeof process.versions&&"string"===typeof process.versions.node;Ba=!za&&!Aa&&!z;var C="",Da,Ea,Fa,Ga;
if(Aa)C=z?require("path").dirname(C)+"/":__dirname+"/",Da=function(a,b){Fa||(Fa=require("fs"));Ga||(Ga=require("path"));a=Ga.normalize(a);return Fa.readFileSync(a,b?null:"utf8")},Ea=function(a){a=Da(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a},1<process.argv.length&&(ya=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),"undefined"!==typeof module&&(module.exports=e),e.inspect=function(){return"[Emscripten Module object]"};else if(Ba)"undefined"!=typeof read&&(Da=function(a){return read(a)}),
Ea=function(a){if("function"===typeof readbuffer)return new Uint8Array(readbuffer(a));a=read(a,"binary");assert("object"===typeof a);return a},"undefined"!==typeof print&&("undefined"===typeof console&&(console={}),console.log=print,console.warn=console.error="undefined"!==typeof printErr?printErr:print);else if(za||z)z?C=self.location.href:document.currentScript&&(C=document.currentScript.src),C=0!==C.indexOf("blob:")?C.substr(0,C.lastIndexOf("/")+1):"",Da=function(a){var b=new XMLHttpRequest;b.open("GET",
a,!1);b.send(null);return b.responseText},z&&(Ea=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)});var Ha=e.print||console.log.bind(console),F=e.printErr||console.warn.bind(console);for(y in xa)xa.hasOwnProperty(y)&&(e[y]=xa[y]);xa=null;e.thisProgram&&(ya=e.thisProgram);var Ia=[],G;function va(a){G.delete(Ja.get(a));Ia.push(a)}
function wa(a){var b=Ja;if(!G){G=new WeakMap;for(var c=0;c<b.length;c++){var d=b.get(c);d&&G.set(d,c)}}if(G.has(a))a=G.get(a);else{if(Ia.length)c=Ia.pop();else{c=b.length;try{b.grow(1)}catch(n){if(!(n instanceof RangeError))throw n;throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}}try{b.set(c,a)}catch(n){if(!(n instanceof TypeError))throw n;if("function"===typeof WebAssembly.Function){var f={i:"i32",j:"i64",f:"f32",d:"f64"},g={parameters:[],results:[]};for(d=1;4>d;++d)g.parameters.push(f["viii"[d]]);
d=new WebAssembly.Function(g,a)}else{f=[1,0,1,96];g={i:127,j:126,f:125,d:124};f.push(3);for(d=0;3>d;++d)f.push(g["iii"[d]]);f.push(0);f[1]=f.length-2;d=new Uint8Array([0,97,115,109,1,0,0,0].concat(f,[2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0]));d=new WebAssembly.Module(d);d=(new WebAssembly.Instance(d,{e:{f:a}})).exports.f}b.set(c,d)}G.set(a,c);a=c}return a}function sa(a){va(a)}var Ka;e.wasmBinary&&(Ka=e.wasmBinary);var noExitRuntime;e.noExitRuntime&&(noExitRuntime=e.noExitRuntime);
"object"!==typeof WebAssembly&&I("no native wasm support detected");
function qa(a){var b="i32";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":x[a>>0]=0;break;case "i8":x[a>>0]=0;break;case "i16":La[a>>1]=0;break;case "i32":J[a>>2]=0;break;case "i64":K=[0,(L=0,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[a>>2]=K[0];J[a+4>>2]=K[1];break;case "float":Ma[a>>2]=0;break;case "double":Na[a>>3]=0;break;default:I("invalid type for setValue: "+b)}}
function p(a,b){b=b||"i8";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":return x[a>>0];case "i8":return x[a>>0];case "i16":return La[a>>1];case "i32":return J[a>>2];case "i64":return J[a>>2];case "float":return Ma[a>>2];case "double":return Na[a>>3];default:I("invalid type for getValue: "+b)}return null}var M,Ja,Oa=!1;function assert(a,b){a||I("Assertion failed: "+b)}function Pa(a){var b=e["_"+a];assert(b,"Cannot call unknown function "+a+", make sure it is exported");return b}
function Qa(a,b,c,d){var f={string:function(v){var B=0;if(null!==v&&void 0!==v&&0!==v){var H=(v.length<<2)+1;B=u(H);pa(v,N,B,H)}return B},array:function(v){var B=u(v.length);x.set(v,B);return B}},g=Pa(a),n=[];a=0;if(d)for(var t=0;t<d.length;t++){var w=f[c[t]];w?(0===a&&(a=na()),n[t]=w(d[t])):n[t]=d[t]}c=g.apply(null,n);c=function(v){return"string"===b?O(v):"boolean"===b?!!v:v}(c);0!==a&&ra(a);return c}var Ra=0,Sa=1;
function la(a){var b=Ra==Sa?u(a.length):Ta(a.length);a.subarray||a.slice?N.set(a,b):N.set(new Uint8Array(a),b);return b}var Ua="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0;
function Va(a,b,c){var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.subarray&&Ua)return Ua.decode(a.subarray(b,c));for(d="";b<c;){var f=a[b++];if(f&128){var g=a[b++]&63;if(192==(f&224))d+=String.fromCharCode((f&31)<<6|g);else{var n=a[b++]&63;f=224==(f&240)?(f&15)<<12|g<<6|n:(f&7)<<18|g<<12|n<<6|a[b++]&63;65536>f?d+=String.fromCharCode(f):(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else d+=String.fromCharCode(f)}return d}function O(a){return a?Va(N,a,void 0):""}
function pa(a,b,c,d){if(!(0<d))return 0;var f=c;d=c+d-1;for(var g=0;g<a.length;++g){var n=a.charCodeAt(g);if(55296<=n&&57343>=n){var t=a.charCodeAt(++g);n=65536+((n&1023)<<10)|t&1023}if(127>=n){if(c>=d)break;b[c++]=n}else{if(2047>=n){if(c+1>=d)break;b[c++]=192|n>>6}else{if(65535>=n){if(c+2>=d)break;b[c++]=224|n>>12}else{if(c+3>=d)break;b[c++]=240|n>>18;b[c++]=128|n>>12&63}b[c++]=128|n>>6&63}b[c++]=128|n&63}}b[c]=0;return c-f}
function oa(a){for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&(d=65536+((d&1023)<<10)|a.charCodeAt(++c)&1023);127>=d?++b:b=2047>=d?b+2:65535>=d?b+3:b+4}return b}function Wa(a){var b=oa(a)+1,c=Ta(b);c&&pa(a,x,c,b);return c}var Xa,x,N,La,J,Ma,Na;
function Ya(a){Xa=a;e.HEAP8=x=new Int8Array(a);e.HEAP16=La=new Int16Array(a);e.HEAP32=J=new Int32Array(a);e.HEAPU8=N=new Uint8Array(a);e.HEAPU16=new Uint16Array(a);e.HEAPU32=new Uint32Array(a);e.HEAPF32=Ma=new Float32Array(a);e.HEAPF64=Na=new Float64Array(a)}var Za=e.INITIAL_MEMORY||16777216;e.wasmMemory?M=e.wasmMemory:M=new WebAssembly.Memory({initial:Za/65536,maximum:32768});M&&(Xa=M.buffer);Za=Xa.byteLength;Ya(Xa);var $a=[],ab=[],bb=[],cb=[];function db(){var a=e.preRun.shift();$a.unshift(a)}
var eb=0,fb=null,gb=null;e.preloadedImages={};e.preloadedAudios={};function I(a){if(e.onAbort)e.onAbort(a);F(a);Oa=!0;throw new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");}function hb(a){var b=ib;return String.prototype.startsWith?b.startsWith(a):0===b.indexOf(a)}function jb(){return hb("data:application/octet-stream;base64,")}var ib="sql-wasm.wasm";if(!jb()){var kb=ib;ib=e.locateFile?e.locateFile(kb,C):C+kb}
function lb(){try{if(Ka)return new Uint8Array(Ka);if(Ea)return Ea(ib);throw"both async and sync fetching of the wasm failed";}catch(a){I(a)}}function mb(){return Ka||!za&&!z||"function"!==typeof fetch||hb("file://")?Promise.resolve().then(lb):fetch(ib,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+ib+"'";return a.arrayBuffer()}).catch(function(){return lb()})}var L,K;
function nb(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(e);else{var c=b.Ab;"number"===typeof c?void 0===b.hb?Ja.get(c)():Ja.get(c)(b.hb):c(void 0===b.hb?null:b.hb)}}}function ob(a){return a.replace(/\b_Z[\w\d_]+/g,function(b){return b===b?b:b+" ["+b+"]"})}
function rb(){function a(g){return(g=g.toTimeString().match(/\(([A-Za-z ]+)\)$/))?g[1]:"GMT"}if(!sb){sb=!0;J[tb()>>2]=60*(new Date).getTimezoneOffset();var b=(new Date).getFullYear(),c=new Date(b,0,1);b=new Date(b,6,1);J[ub()>>2]=Number(c.getTimezoneOffset()!=b.getTimezoneOffset());var d=a(c),f=a(b);d=Wa(d);f=Wa(f);b.getTimezoneOffset()<c.getTimezoneOffset()?(J[wb()>>2]=d,J[wb()+4>>2]=f):(J[wb()>>2]=f,J[wb()+4>>2]=d)}}var sb;
function xb(a,b){for(var c=0,d=a.length-1;0<=d;d--){var f=a[d];"."===f?a.splice(d,1):".."===f?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a}function k(a){var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=xb(a.split("/").filter(function(d){return!!d}),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a}
function yb(a){var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return".";b&&(b=b.substr(0,b.length-1));return a+b}function zb(a){if("/"===a)return"/";a=k(a);a=a.replace(/\/$/,"");var b=a.lastIndexOf("/");return-1===b?a:a.substr(b+1)}function Ab(a){J[Bb()>>2]=a}
function Cb(){if("object"===typeof crypto&&"function"===typeof crypto.getRandomValues){var a=new Uint8Array(1);return function(){crypto.getRandomValues(a);return a[0]}}if(Aa)try{var b=require("crypto");return function(){return b.randomBytes(1)[0]}}catch(c){}return function(){I("randomDevice")}}
function Db(){for(var a="",b=!1,c=arguments.length-1;-1<=c&&!b;c--){b=0<=c?arguments[c]:"/";if("string"!==typeof b)throw new TypeError("Arguments to path.resolve must be strings");if(!b)return"";a=b+"/"+a;b="/"===b.charAt(0)}a=xb(a.split("/").filter(function(d){return!!d}),!b).join("/");return(b?"/":"")+a||"."}var Eb=[];function Fb(a,b){Eb[a]={input:[],output:[],$a:b};Gb(a,Hb)}
var Hb={open:function(a){var b=Eb[a.node.rdev];if(!b)throw new Q(43);a.tty=b;a.seekable=!1},close:function(a){a.tty.$a.flush(a.tty)},flush:function(a){a.tty.$a.flush(a.tty)},read:function(a,b,c,d){if(!a.tty||!a.tty.$a.qb)throw new Q(60);for(var f=0,g=0;g<d;g++){try{var n=a.tty.$a.qb(a.tty)}catch(t){throw new Q(29);}if(void 0===n&&0===f)throw new Q(6);if(null===n||void 0===n)break;f++;b[c+g]=n}f&&(a.node.timestamp=Date.now());return f},write:function(a,b,c,d){if(!a.tty||!a.tty.$a.jb)throw new Q(60);
try{for(var f=0;f<d;f++)a.tty.$a.jb(a.tty,b[c+f])}catch(g){throw new Q(29);}d&&(a.node.timestamp=Date.now());return f}},Ib={qb:function(a){if(!a.input.length){var b=null;if(Aa){var c=Buffer.sb?Buffer.sb(256):new Buffer(256),d=0;try{d=Fa.readSync(process.stdin.fd,c,0,256,null)}catch(f){if(-1!=f.toString().indexOf("EOF"))d=0;else throw f;}0<d?b=c.slice(0,d).toString("utf-8"):b=null}else"undefined"!=typeof window&&"function"==typeof window.prompt?(b=window.prompt("Input: "),null!==b&&(b+="\n")):"function"==
typeof readline&&(b=readline(),null!==b&&(b+="\n"));if(!b)return null;a.input=ka(b,!0)}return a.input.shift()},jb:function(a,b){null===b||10===b?(Ha(Va(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&(Ha(Va(a.output,0)),a.output=[])}},Jb={jb:function(a,b){null===b||10===b?(F(Va(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&(F(Va(a.output,0)),a.output=[])}},R={Ta:null,Ua:function(){return R.createNode(null,
"/",16895,0)},createNode:function(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new Q(63);R.Ta||(R.Ta={dir:{node:{Sa:R.La.Sa,Ra:R.La.Ra,lookup:R.La.lookup,ab:R.La.ab,rename:R.La.rename,unlink:R.La.unlink,rmdir:R.La.rmdir,readdir:R.La.readdir,symlink:R.La.symlink},stream:{Xa:R.Ma.Xa}},file:{node:{Sa:R.La.Sa,Ra:R.La.Ra},stream:{Xa:R.Ma.Xa,read:R.Ma.read,write:R.Ma.write,lb:R.Ma.lb,bb:R.Ma.bb,cb:R.Ma.cb}},link:{node:{Sa:R.La.Sa,Ra:R.La.Ra,readlink:R.La.readlink},stream:{}},nb:{node:{Sa:R.La.Sa,
Ra:R.La.Ra},stream:Kb}});c=Lb(a,b,c,d);S(c.mode)?(c.La=R.Ta.dir.node,c.Ma=R.Ta.dir.stream,c.Ka={}):32768===(c.mode&61440)?(c.La=R.Ta.file.node,c.Ma=R.Ta.file.stream,c.Qa=0,c.Ka=null):40960===(c.mode&61440)?(c.La=R.Ta.link.node,c.Ma=R.Ta.link.stream):8192===(c.mode&61440)&&(c.La=R.Ta.nb.node,c.Ma=R.Ta.nb.stream);c.timestamp=Date.now();a&&(a.Ka[b]=c);return c},Lb:function(a){if(a.Ka&&a.Ka.subarray){for(var b=[],c=0;c<a.Qa;++c)b.push(a.Ka[c]);return b}return a.Ka},Mb:function(a){return a.Ka?a.Ka.subarray?
a.Ka.subarray(0,a.Qa):new Uint8Array(a.Ka):new Uint8Array(0)},ob:function(a,b){var c=a.Ka?a.Ka.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)>>>0),0!=c&&(b=Math.max(b,256)),c=a.Ka,a.Ka=new Uint8Array(b),0<a.Qa&&a.Ka.set(c.subarray(0,a.Qa),0))},Ib:function(a,b){if(a.Qa!=b)if(0==b)a.Ka=null,a.Qa=0;else{if(!a.Ka||a.Ka.subarray){var c=a.Ka;a.Ka=new Uint8Array(b);c&&a.Ka.set(c.subarray(0,Math.min(b,a.Qa)))}else if(a.Ka||(a.Ka=[]),a.Ka.length>b)a.Ka.length=b;else for(;a.Ka.length<b;)a.Ka.push(0);a.Qa=
b}},La:{Sa:function(a){var b={};b.dev=8192===(a.mode&61440)?a.id:1;b.ino=a.id;b.mode=a.mode;b.nlink=1;b.uid=0;b.gid=0;b.rdev=a.rdev;S(a.mode)?b.size=4096:32768===(a.mode&61440)?b.size=a.Qa:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.atime=new Date(a.timestamp);b.mtime=new Date(a.timestamp);b.ctime=new Date(a.timestamp);b.zb=4096;b.blocks=Math.ceil(b.size/b.zb);return b},Ra:function(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);void 0!==b.size&&R.Ib(a,
b.size)},lookup:function(){throw Mb[44];},ab:function(a,b,c,d){return R.createNode(a,b,c,d)},rename:function(a,b,c){if(S(a.mode)){try{var d=Nb(b,c)}catch(g){}if(d)for(var f in d.Ka)throw new Q(55);}delete a.parent.Ka[a.name];a.name=c;b.Ka[c]=a;a.parent=b},unlink:function(a,b){delete a.Ka[b]},rmdir:function(a,b){var c=Nb(a,b),d;for(d in c.Ka)throw new Q(55);delete a.Ka[b]},readdir:function(a){var b=[".",".."],c;for(c in a.Ka)a.Ka.hasOwnProperty(c)&&b.push(c);return b},symlink:function(a,b,c){a=R.createNode(a,
b,41471,0);a.link=c;return a},readlink:function(a){if(40960!==(a.mode&61440))throw new Q(28);return a.link}},Ma:{read:function(a,b,c,d,f){var g=a.node.Ka;if(f>=a.node.Qa)return 0;a=Math.min(a.node.Qa-f,d);if(8<a&&g.subarray)b.set(g.subarray(f,f+a),c);else for(d=0;d<a;d++)b[c+d]=g[f+d];return a},write:function(a,b,c,d,f,g){b.buffer===x.buffer&&(g=!1);if(!d)return 0;a=a.node;a.timestamp=Date.now();if(b.subarray&&(!a.Ka||a.Ka.subarray)){if(g)return a.Ka=b.subarray(c,c+d),a.Qa=d;if(0===a.Qa&&0===f)return a.Ka=
b.slice(c,c+d),a.Qa=d;if(f+d<=a.Qa)return a.Ka.set(b.subarray(c,c+d),f),d}R.ob(a,f+d);if(a.Ka.subarray&&b.subarray)a.Ka.set(b.subarray(c,c+d),f);else for(g=0;g<d;g++)a.Ka[f+g]=b[c+g];a.Qa=Math.max(a.Qa,f+d);return d},Xa:function(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.Qa);if(0>b)throw new Q(28);return b},lb:function(a,b,c){R.ob(a.node,b+c);a.node.Qa=Math.max(a.node.Qa,b+c)},bb:function(a,b,c,d,f,g){assert(0===b);if(32768!==(a.node.mode&61440))throw new Q(43);a=a.node.Ka;
if(g&2||a.buffer!==Xa){if(0<d||d+c<a.length)a.subarray?a=a.subarray(d,d+c):a=Array.prototype.slice.call(a,d,d+c);d=!0;g=16384*Math.ceil(c/16384);for(b=Ta(g);c<g;)x[b+c++]=0;c=b;if(!c)throw new Q(48);x.set(a,c)}else d=!1,c=a.byteOffset;return{Hb:c,fb:d}},cb:function(a,b,c,d,f){if(32768!==(a.node.mode&61440))throw new Q(43);if(f&2)return 0;R.Ma.write(a,b,0,d,c,!1);return 0}}},Ob=null,Pb={},T=[],Qb=1,U=null,Rb=!0,V={},Q=null,Mb={};
function W(a,b){a=Db("/",a);b=b||{};if(!a)return{path:"",node:null};var c={pb:!0,kb:0},d;for(d in c)void 0===b[d]&&(b[d]=c[d]);if(8<b.kb)throw new Q(32);a=xb(a.split("/").filter(function(n){return!!n}),!1);var f=Ob;c="/";for(d=0;d<a.length;d++){var g=d===a.length-1;if(g&&b.parent)break;f=Nb(f,a[d]);c=k(c+"/"+a[d]);f.Ya&&(!g||g&&b.pb)&&(f=f.Ya.root);if(!g||b.Wa)for(g=0;40960===(f.mode&61440);)if(f=Sb(c),c=Db(yb(c),f),f=W(c,{kb:b.kb}).node,40<g++)throw new Q(32);}return{path:c,node:f}}
function Tb(a){for(var b;;){if(a===a.parent)return a=a.Ua.rb,b?"/"!==a[a.length-1]?a+"/"+b:a+b:a;b=b?a.name+"/"+b:a.name;a=a.parent}}function Ub(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%U.length}function Vb(a){var b=Ub(a.parent.id,a.name);if(U[b]===a)U[b]=a.Za;else for(b=U[b];b;){if(b.Za===a){b.Za=a.Za;break}b=b.Za}}
function Nb(a,b){var c;if(c=(c=Wb(a,"x"))?c:a.La.lookup?0:2)throw new Q(c,a);for(c=U[Ub(a.id,b)];c;c=c.Za){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.La.lookup(a,b)}function Lb(a,b,c,d){a=new Xb(a,b,c,d);b=Ub(a.parent.id,a.name);a.Za=U[b];return U[b]=a}function S(a){return 16384===(a&61440)}var Yb={r:0,rs:1052672,"r+":2,w:577,wx:705,xw:705,"w+":578,"wx+":706,"xw+":706,a:1089,ax:1217,xa:1217,"a+":1090,"ax+":1218,"xa+":1218};
function Zb(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}function Wb(a,b){if(Rb)return 0;if(-1===b.indexOf("r")||a.mode&292){if(-1!==b.indexOf("w")&&!(a.mode&146)||-1!==b.indexOf("x")&&!(a.mode&73))return 2}else return 2;return 0}function $b(a,b){try{return Nb(a,b),20}catch(c){}return Wb(a,"wx")}function ac(a,b,c){try{var d=Nb(a,b)}catch(f){return f.Na}if(a=Wb(a,"wx"))return a;if(c){if(!S(d.mode))return 54;if(d===d.parent||"/"===Tb(d))return 10}else if(S(d.mode))return 31;return 0}
function bc(a){var b=4096;for(a=a||0;a<=b;a++)if(!T[a])return a;throw new Q(33);}function cc(a,b){dc||(dc=function(){},dc.prototype={});var c=new dc,d;for(d in a)c[d]=a[d];a=c;b=bc(b);a.fd=b;return T[b]=a}var Kb={open:function(a){a.Ma=Pb[a.node.rdev].Ma;a.Ma.open&&a.Ma.open(a)},Xa:function(){throw new Q(70);}};function Gb(a,b){Pb[a]={Ma:b}}
function ec(a,b){var c="/"===b,d=!b;if(c&&Ob)throw new Q(10);if(!c&&!d){var f=W(b,{pb:!1});b=f.path;f=f.node;if(f.Ya)throw new Q(10);if(!S(f.mode))throw new Q(54);}b={type:a,Nb:{},rb:b,Fb:[]};a=a.Ua(b);a.Ua=b;b.root=a;c?Ob=a:f&&(f.Ya=b,f.Ua&&f.Ua.Fb.push(b))}function ba(a,b,c){var d=W(a,{parent:!0}).node;a=zb(a);if(!a||"."===a||".."===a)throw new Q(28);var f=$b(d,a);if(f)throw new Q(f);if(!d.La.ab)throw new Q(63);return d.La.ab(d,a,b,c)}function X(a,b){ba(a,(void 0!==b?b:511)&1023|16384,0)}
function fc(a,b,c){"undefined"===typeof c&&(c=b,b=438);ba(a,b|8192,c)}function hc(a,b){if(!Db(a))throw new Q(44);var c=W(b,{parent:!0}).node;if(!c)throw new Q(44);b=zb(b);var d=$b(c,b);if(d)throw new Q(d);if(!c.La.symlink)throw new Q(63);c.La.symlink(c,b,a)}
function ua(a){var b=W(a,{parent:!0}).node,c=zb(a),d=Nb(b,c),f=ac(b,c,!1);if(f)throw new Q(f);if(!b.La.unlink)throw new Q(63);if(d.Ya)throw new Q(10);try{V.willDeletePath&&V.willDeletePath(a)}catch(g){F("FS.trackingDelegate['willDeletePath']('"+a+"') threw an exception: "+g.message)}b.La.unlink(b,c);Vb(d);try{if(V.onDeletePath)V.onDeletePath(a)}catch(g){F("FS.trackingDelegate['onDeletePath']('"+a+"') threw an exception: "+g.message)}}
function Sb(a){a=W(a).node;if(!a)throw new Q(44);if(!a.La.readlink)throw new Q(28);return Db(Tb(a.parent),a.La.readlink(a))}function ic(a,b){a=W(a,{Wa:!b}).node;if(!a)throw new Q(44);if(!a.La.Sa)throw new Q(63);return a.La.Sa(a)}function jc(a){return ic(a,!0)}function ca(a,b){var c;"string"===typeof a?c=W(a,{Wa:!0}).node:c=a;if(!c.La.Ra)throw new Q(63);c.La.Ra(c,{mode:b&4095|c.mode&-4096,timestamp:Date.now()})}
function kc(a){var b;"string"===typeof a?b=W(a,{Wa:!0}).node:b=a;if(!b.La.Ra)throw new Q(63);b.La.Ra(b,{timestamp:Date.now()})}function lc(a,b){if(0>b)throw new Q(28);var c;"string"===typeof a?c=W(a,{Wa:!0}).node:c=a;if(!c.La.Ra)throw new Q(63);if(S(c.mode))throw new Q(31);if(32768!==(c.mode&61440))throw new Q(28);if(a=Wb(c,"w"))throw new Q(a);c.La.Ra(c,{size:b,timestamp:Date.now()})}
function m(a,b,c,d){if(""===a)throw new Q(44);if("string"===typeof b){var f=Yb[b];if("undefined"===typeof f)throw Error("Unknown file open mode: "+b);b=f}c=b&64?("undefined"===typeof c?438:c)&4095|32768:0;if("object"===typeof a)var g=a;else{a=k(a);try{g=W(a,{Wa:!(b&131072)}).node}catch(n){}}f=!1;if(b&64)if(g){if(b&128)throw new Q(20);}else g=ba(a,c,0),f=!0;if(!g)throw new Q(44);8192===(g.mode&61440)&&(b&=-513);if(b&65536&&!S(g.mode))throw new Q(54);if(!f&&(c=g?40960===(g.mode&61440)?32:S(g.mode)&&
("r"!==Zb(b)||b&512)?31:Wb(g,Zb(b)):44))throw new Q(c);b&512&&lc(g,0);b&=-131713;d=cc({node:g,path:Tb(g),flags:b,seekable:!0,position:0,Ma:g.Ma,Kb:[],error:!1},d);d.Ma.open&&d.Ma.open(d);!e.logReadFiles||b&1||(Mc||(Mc={}),a in Mc||(Mc[a]=1,F("FS.trackingDelegate error on read file: "+a)));try{V.onOpenFile&&(g=0,1!==(b&2097155)&&(g|=1),0!==(b&2097155)&&(g|=2),V.onOpenFile(a,g))}catch(n){F("FS.trackingDelegate['onOpenFile']('"+a+"', flags) threw an exception: "+n.message)}return d}
function ja(a){if(null===a.fd)throw new Q(8);a.ib&&(a.ib=null);try{a.Ma.close&&a.Ma.close(a)}catch(b){throw b;}finally{T[a.fd]=null}a.fd=null}function Nc(a,b,c){if(null===a.fd)throw new Q(8);if(!a.seekable||!a.Ma.Xa)throw new Q(70);if(0!=c&&1!=c&&2!=c)throw new Q(28);a.position=a.Ma.Xa(a,b,c);a.Kb=[]}
function Pc(a,b,c,d,f){if(0>d||0>f)throw new Q(28);if(null===a.fd)throw new Q(8);if(1===(a.flags&2097155))throw new Q(8);if(S(a.node.mode))throw new Q(31);if(!a.Ma.read)throw new Q(28);var g="undefined"!==typeof f;if(!g)f=a.position;else if(!a.seekable)throw new Q(70);b=a.Ma.read(a,b,c,d,f);g||(a.position+=b);return b}
function fa(a,b,c,d,f,g){if(0>d||0>f)throw new Q(28);if(null===a.fd)throw new Q(8);if(0===(a.flags&2097155))throw new Q(8);if(S(a.node.mode))throw new Q(31);if(!a.Ma.write)throw new Q(28);a.seekable&&a.flags&1024&&Nc(a,0,2);var n="undefined"!==typeof f;if(!n)f=a.position;else if(!a.seekable)throw new Q(70);b=a.Ma.write(a,b,c,d,f,g);n||(a.position+=b);try{if(a.path&&V.onWriteToFile)V.onWriteToFile(a.path)}catch(t){F("FS.trackingDelegate['onWriteToFile']('"+a.path+"') threw an exception: "+t.message)}return b}
function ta(a){var b={encoding:"binary"};b=b||{};b.flags=b.flags||"r";b.encoding=b.encoding||"binary";if("utf8"!==b.encoding&&"binary"!==b.encoding)throw Error('Invalid encoding type "'+b.encoding+'"');var c,d=m(a,b.flags);a=ic(a).size;var f=new Uint8Array(a);Pc(d,f,0,a,0);"utf8"===b.encoding?c=Va(f,0):"binary"===b.encoding&&(c=f);ja(d);return c}
function Qc(){Q||(Q=function(a,b){this.node=b;this.Jb=function(c){this.Na=c};this.Jb(a);this.message="FS error"},Q.prototype=Error(),Q.prototype.constructor=Q,[44].forEach(function(a){Mb[a]=new Q(a);Mb[a].stack="<generic error, no stack>"}))}var Rc;function aa(a,b){var c=0;a&&(c|=365);b&&(c|=146);return c}
function Sc(a,b,c){a=k("/dev/"+a);var d=aa(!!b,!!c);Tc||(Tc=64);var f=Tc++<<8|0;Gb(f,{open:function(g){g.seekable=!1},close:function(){c&&c.buffer&&c.buffer.length&&c(10)},read:function(g,n,t,w){for(var v=0,B=0;B<w;B++){try{var H=b()}catch(ea){throw new Q(29);}if(void 0===H&&0===v)throw new Q(6);if(null===H||void 0===H)break;v++;n[t+B]=H}v&&(g.node.timestamp=Date.now());return v},write:function(g,n,t,w){for(var v=0;v<w;v++)try{c(n[t+v])}catch(B){throw new Q(29);}w&&(g.node.timestamp=Date.now());return v}});
fc(a,d,f)}var Tc,Y={},dc,Mc,Uc={};
function Vc(a,b,c){try{var d=a(b)}catch(f){if(f&&f.node&&k(b)!==k(Tb(f.node)))return-54;throw f;}J[c>>2]=d.dev;J[c+4>>2]=0;J[c+8>>2]=d.ino;J[c+12>>2]=d.mode;J[c+16>>2]=d.nlink;J[c+20>>2]=d.uid;J[c+24>>2]=d.gid;J[c+28>>2]=d.rdev;J[c+32>>2]=0;K=[d.size>>>0,(L=d.size,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[c+40>>2]=K[0];J[c+44>>2]=K[1];J[c+48>>2]=4096;J[c+52>>2]=d.blocks;J[c+56>>2]=d.atime.getTime()/1E3|0;J[c+60>>2]=
0;J[c+64>>2]=d.mtime.getTime()/1E3|0;J[c+68>>2]=0;J[c+72>>2]=d.ctime.getTime()/1E3|0;J[c+76>>2]=0;K=[d.ino>>>0,(L=d.ino,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[c+80>>2]=K[0];J[c+84>>2]=K[1];return 0}var Wc=void 0;function Xc(){Wc+=4;return J[Wc-4>>2]}function Z(a){a=T[a];if(!a)throw new Q(8);return a}var Yc={};
function Zc(){if(!$c){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"===typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:ya||"./this.program"},b;for(b in Yc)a[b]=Yc[b];var c=[];for(b in a)c.push(b+"="+a[b]);$c=c}return $c}var $c,ad;Aa?ad=function(){var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:"undefined"!==typeof dateNow?ad=dateNow:ad=function(){return performance.now()};
function bd(a){for(var b=ad();ad()-b<a/1E3;);}e._usleep=bd;function Xb(a,b,c,d){a||(a=this);this.parent=a;this.Ua=a.Ua;this.Ya=null;this.id=Qb++;this.name=b;this.mode=c;this.La={};this.Ma={};this.rdev=d}Object.defineProperties(Xb.prototype,{read:{get:function(){return 365===(this.mode&365)},set:function(a){a?this.mode|=365:this.mode&=-366}},write:{get:function(){return 146===(this.mode&146)},set:function(a){a?this.mode|=146:this.mode&=-147}}});Qc();U=Array(4096);ec(R,"/");X("/tmp");X("/home");X("/home/web_user");
(function(){X("/dev");Gb(259,{read:function(){return 0},write:function(b,c,d,f){return f}});fc("/dev/null",259);Fb(1280,Ib);Fb(1536,Jb);fc("/dev/tty",1280);fc("/dev/tty1",1536);var a=Cb();Sc("random",a);Sc("urandom",a);X("/dev/shm");X("/dev/shm/tmp")})();X("/proc");X("/proc/self");X("/proc/self/fd");
ec({Ua:function(){var a=Lb("/proc/self","fd",16895,73);a.La={lookup:function(b,c){var d=T[+c];if(!d)throw new Q(8);b={parent:null,Ua:{rb:"fake"},La:{readlink:function(){return d.path}}};return b.parent=b}};return a}},"/proc/self/fd");function ka(a,b){var c=Array(oa(a)+1);a=pa(a,c,0,c.length);b&&(c.length=a);return c}ab.push({Ab:function(){cd()}});
var fd={b:function(a,b,c,d){I("Assertion failed: "+O(a)+", at: "+[b?O(b):"unknown filename",c,d?O(d):"unknown function"])},q:function(a,b){rb();a=new Date(1E3*J[a>>2]);J[b>>2]=a.getSeconds();J[b+4>>2]=a.getMinutes();J[b+8>>2]=a.getHours();J[b+12>>2]=a.getDate();J[b+16>>2]=a.getMonth();J[b+20>>2]=a.getFullYear()-1900;J[b+24>>2]=a.getDay();var c=new Date(a.getFullYear(),0,1);J[b+28>>2]=(a.getTime()-c.getTime())/864E5|0;J[b+36>>2]=-(60*a.getTimezoneOffset());var d=(new Date(a.getFullYear(),6,1)).getTimezoneOffset();
c=c.getTimezoneOffset();a=(d!=c&&a.getTimezoneOffset()==Math.min(c,d))|0;J[b+32>>2]=a;a=J[wb()+(a?4:0)>>2];J[b+40>>2]=a;return b},I:function(a,b){try{a=O(a);if(b&-8)var c=-28;else{var d;(d=W(a,{Wa:!0}).node)?(a="",b&4&&(a+="r"),b&2&&(a+="w"),b&1&&(a+="x"),c=a&&Wb(d,a)?-2:0):c=-44}return c}catch(f){return"undefined"!==typeof Y&&f instanceof Q||I(f),-f.Na}},t:function(a,b){try{return a=O(a),ca(a,b),0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),-c.Na}},z:function(a){try{return a=O(a),
kc(a),0}catch(b){return"undefined"!==typeof Y&&b instanceof Q||I(b),-b.Na}},u:function(a,b){try{var c=T[a];if(!c)throw new Q(8);ca(c.node,b);return 0}catch(d){return"undefined"!==typeof Y&&d instanceof Q||I(d),-d.Na}},B:function(a){try{var b=T[a];if(!b)throw new Q(8);kc(b.node);return 0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),-c.Na}},c:function(a,b,c){Wc=c;try{var d=Z(a);switch(b){case 0:var f=Xc();return 0>f?-28:m(d.path,d.flags,0,f).fd;case 1:case 2:return 0;case 3:return d.flags;
case 4:return f=Xc(),d.flags|=f,0;case 12:return f=Xc(),La[f+0>>1]=2,0;case 13:case 14:return 0;case 16:case 8:return-28;case 9:return Ab(28),-1;default:return-28}}catch(g){return"undefined"!==typeof Y&&g instanceof Q||I(g),-g.Na}},w:function(a,b){try{var c=Z(a);return Vc(ic,c.path,b)}catch(d){return"undefined"!==typeof Y&&d instanceof Q||I(d),-d.Na}},F:function(a,b,c){try{var d=T[a];if(!d)throw new Q(8);if(0===(d.flags&2097155))throw new Q(28);lc(d.node,c);return 0}catch(f){return"undefined"!==typeof Y&&
f instanceof Q||I(f),-f.Na}},J:function(a,b){try{if(0===b)return-28;if(b<oa("/")+1)return-68;pa("/",N,a,b);return a}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),-c.Na}},D:function(){return 0},e:function(){return 42},v:function(a,b){try{return a=O(a),Vc(jc,a,b)}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),-c.Na}},s:function(a,b){try{return a=O(a),a=k(a),"/"===a[a.length-1]&&(a=a.substr(0,a.length-1)),X(a,b),0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),
-c.Na}},j:function(a,b,c,d,f,g){try{a:{g<<=12;var n=!1;if(0!==(d&16)&&0!==a%16384)var t=-28;else{if(0!==(d&32)){var w=dd(16384,b);if(!w){t=-48;break a}ed(w,0,b);n=!0}else{var v=T[f];if(!v){t=-8;break a}var B=g;if(0!==(c&2)&&0===(d&2)&&2!==(v.flags&2097155))throw new Q(2);if(1===(v.flags&2097155))throw new Q(2);if(!v.Ma.bb)throw new Q(43);var H=v.Ma.bb(v,a,b,B,c,d);w=H.Hb;n=H.fb}Uc[w]={Eb:w,Db:b,fb:n,fd:f,Gb:c,flags:d,offset:g};t=w}}return t}catch(ea){return"undefined"!==typeof Y&&ea instanceof Q||
I(ea),-ea.Na}},k:function(a,b){try{if(-1===(a|0)||0===b)var c=-28;else{var d=Uc[a];if(d&&b===d.Db){var f=T[d.fd];if(d.Gb&2){var g=d.flags,n=d.offset,t=N.slice(a,a+b);f&&f.Ma.cb&&f.Ma.cb(f,t,n,b,g)}Uc[a]=null;d.fb&&ma(d.Eb)}c=0}return c}catch(w){return"undefined"!==typeof Y&&w instanceof Q||I(w),-w.Na}},i:function(a,b,c){Wc=c;try{var d=O(a),f=Xc();return m(d,b,f).fd}catch(g){return"undefined"!==typeof Y&&g instanceof Q||I(g),-g.Na}},x:function(a,b,c){try{var d=Z(a);return Pc(d,x,b,c)}catch(f){return"undefined"!==
typeof Y&&f instanceof Q||I(f),-f.Na}},C:function(a,b,c){try{a=O(a);if(0>=c)var d=-28;else{var f=Sb(a),g=Math.min(c,oa(f)),n=x[b+g];pa(f,N,b,c+1);x[b+g]=n;d=g}return d}catch(t){return"undefined"!==typeof Y&&t instanceof Q||I(t),-t.Na}},H:function(a){try{a=O(a);var b=W(a,{parent:!0}).node,c=zb(a),d=Nb(b,c),f=ac(b,c,!0);if(f)throw new Q(f);if(!b.La.rmdir)throw new Q(63);if(d.Ya)throw new Q(10);try{V.willDeletePath&&V.willDeletePath(a)}catch(g){F("FS.trackingDelegate['willDeletePath']('"+a+"') threw an exception: "+
g.message)}b.La.rmdir(b,c);Vb(d);try{if(V.onDeletePath)V.onDeletePath(a)}catch(g){F("FS.trackingDelegate['onDeletePath']('"+a+"') threw an exception: "+g.message)}return 0}catch(g){return"undefined"!==typeof Y&&g instanceof Q||I(g),-g.Na}},g:function(a,b){try{return a=O(a),Vc(ic,a,b)}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),-c.Na}},G:function(a){try{return a=O(a),ua(a),0}catch(b){return"undefined"!==typeof Y&&b instanceof Q||I(b),-b.Na}},m:function(a,b,c){N.copyWithin(a,b,b+c)},
d:function(a){a>>>=0;var b=N.length;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);d=Math.max(16777216,a,d);0<d%65536&&(d+=65536-d%65536);a:{try{M.grow(Math.min(2147483648,d)-Xa.byteLength+65535>>>16);Ya(M.buffer);var f=1;break a}catch(g){}f=void 0}if(f)return!0}return!1},o:function(a,b){var c=0;Zc().forEach(function(d,f){var g=b+c;f=J[a+4*f>>2]=g;for(g=0;g<d.length;++g)x[f++>>0]=d.charCodeAt(g);x[f>>0]=0;c+=d.length+1});return 0},p:function(a,b){var c=
Zc();J[a>>2]=c.length;var d=0;c.forEach(function(f){d+=f.length+1});J[b>>2]=d;return 0},f:function(a){try{var b=Z(a);ja(b);return 0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),c.Na}},n:function(a,b){try{var c=Z(a);x[b>>0]=c.tty?2:S(c.mode)?3:40960===(c.mode&61440)?7:4;return 0}catch(d){return"undefined"!==typeof Y&&d instanceof Q||I(d),d.Na}},l:function(a,b,c,d,f){try{var g=Z(a);a=4294967296*c+(b>>>0);if(-9007199254740992>=a||9007199254740992<=a)return-61;Nc(g,a,d);K=[g.position>>>
0,(L=g.position,1<=+Math.abs(L)?0<L?(Math.min(+Math.floor(L/4294967296),4294967295)|0)>>>0:~~+Math.ceil((L-+(~~L>>>0))/4294967296)>>>0:0)];J[f>>2]=K[0];J[f+4>>2]=K[1];g.ib&&0===a&&0===d&&(g.ib=null);return 0}catch(n){return"undefined"!==typeof Y&&n instanceof Q||I(n),n.Na}},E:function(a){try{var b=Z(a);return b.Ma&&b.Ma.fsync?-b.Ma.fsync(b):0}catch(c){return"undefined"!==typeof Y&&c instanceof Q||I(c),c.Na}},y:function(a,b,c,d){try{a:{for(var f=Z(a),g=a=0;g<c;g++){var n=fa(f,x,J[b+8*g>>2],J[b+(8*
g+4)>>2],void 0);if(0>n){var t=-1;break a}a+=n}t=a}J[d>>2]=t;return 0}catch(w){return"undefined"!==typeof Y&&w instanceof Q||I(w),w.Na}},h:function(a){var b=Date.now();J[a>>2]=b/1E3|0;J[a+4>>2]=b%1E3*1E3|0;return 0},a:M,K:function(a,b){if(0===a)return Ab(28),-1;var c=J[a>>2];a=J[a+4>>2];if(0>a||999999999<a||0>c)return Ab(28),-1;0!==b&&(J[b>>2]=0,J[b+4>>2]=0);return bd(1E6*c+a/1E3)},A:function(a){switch(a){case 30:return 16384;case 85:return 131072;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:case 79:return 200809;
case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return-1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;
case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1E3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:return"object"===typeof navigator?navigator.hardwareConcurrency||1:1}Ab(28);return-1},
L:function(a){var b=Date.now()/1E3|0;a&&(J[a>>2]=b);return b},r:function(a,b){if(b){var c=1E3*J[b+8>>2];c+=J[b+12>>2]/1E3}else c=Date.now();a=O(a);try{b=c;var d=W(a,{Wa:!0}).node;d.La.Ra(d,{timestamp:Math.max(b,c)});return 0}catch(f){a=f;if(!(a instanceof Q)){a+=" : ";a:{d=Error();if(!d.stack){try{throw Error();}catch(g){d=g}if(!d.stack){d="(no stack trace available)";break a}}d=d.stack.toString()}e.extraStackTrace&&(d+="\n"+e.extraStackTrace());d=ob(d);throw a+d;}Ab(a.Na);return-1}}};
(function(){function a(f){e.asm=f.exports;Ja=e.asm.M;eb--;e.monitorRunDependencies&&e.monitorRunDependencies(eb);0==eb&&(null!==fb&&(clearInterval(fb),fb=null),gb&&(f=gb,gb=null,f()))}function b(f){a(f.instance)}function c(f){return mb().then(function(g){return WebAssembly.instantiate(g,d)}).then(f,function(g){F("failed to asynchronously prepare wasm: "+g);I(g)})}var d={a:fd};eb++;e.monitorRunDependencies&&e.monitorRunDependencies(eb);if(e.instantiateWasm)try{return e.instantiateWasm(d,a)}catch(f){return F("Module.instantiateWasm callback failed with error: "+
f),!1}(function(){if(Ka||"function"!==typeof WebAssembly.instantiateStreaming||jb()||hb("file://")||"function"!==typeof fetch)return c(b);fetch(ib,{credentials:"same-origin"}).then(function(f){return WebAssembly.instantiateStreaming(f,d).then(b,function(g){F("wasm streaming compile failed: "+g);F("falling back to ArrayBuffer instantiation");return c(b)})})})();return{}})();
var cd=e.___wasm_call_ctors=function(){return(cd=e.___wasm_call_ctors=e.asm.N).apply(null,arguments)},ed=e._memset=function(){return(ed=e._memset=e.asm.O).apply(null,arguments)};e._sqlite3_free=function(){return(e._sqlite3_free=e.asm.P).apply(null,arguments)};var Bb=e.___errno_location=function(){return(Bb=e.___errno_location=e.asm.Q).apply(null,arguments)};e._sqlite3_finalize=function(){return(e._sqlite3_finalize=e.asm.R).apply(null,arguments)};
e._sqlite3_reset=function(){return(e._sqlite3_reset=e.asm.S).apply(null,arguments)};e._sqlite3_clear_bindings=function(){return(e._sqlite3_clear_bindings=e.asm.T).apply(null,arguments)};e._sqlite3_value_blob=function(){return(e._sqlite3_value_blob=e.asm.U).apply(null,arguments)};e._sqlite3_value_text=function(){return(e._sqlite3_value_text=e.asm.V).apply(null,arguments)};e._sqlite3_value_bytes=function(){return(e._sqlite3_value_bytes=e.asm.W).apply(null,arguments)};
e._sqlite3_value_double=function(){return(e._sqlite3_value_double=e.asm.X).apply(null,arguments)};e._sqlite3_value_int=function(){return(e._sqlite3_value_int=e.asm.Y).apply(null,arguments)};e._sqlite3_value_type=function(){return(e._sqlite3_value_type=e.asm.Z).apply(null,arguments)};e._sqlite3_result_blob=function(){return(e._sqlite3_result_blob=e.asm._).apply(null,arguments)};e._sqlite3_result_double=function(){return(e._sqlite3_result_double=e.asm.$).apply(null,arguments)};
e._sqlite3_result_error=function(){return(e._sqlite3_result_error=e.asm.aa).apply(null,arguments)};e._sqlite3_result_int=function(){return(e._sqlite3_result_int=e.asm.ba).apply(null,arguments)};e._sqlite3_result_int64=function(){return(e._sqlite3_result_int64=e.asm.ca).apply(null,arguments)};e._sqlite3_result_null=function(){return(e._sqlite3_result_null=e.asm.da).apply(null,arguments)};e._sqlite3_result_text=function(){return(e._sqlite3_result_text=e.asm.ea).apply(null,arguments)};
e._sqlite3_step=function(){return(e._sqlite3_step=e.asm.fa).apply(null,arguments)};e._sqlite3_column_count=function(){return(e._sqlite3_column_count=e.asm.ga).apply(null,arguments)};e._sqlite3_data_count=function(){return(e._sqlite3_data_count=e.asm.ha).apply(null,arguments)};e._sqlite3_column_blob=function(){return(e._sqlite3_column_blob=e.asm.ia).apply(null,arguments)};e._sqlite3_column_bytes=function(){return(e._sqlite3_column_bytes=e.asm.ja).apply(null,arguments)};
e._sqlite3_column_double=function(){return(e._sqlite3_column_double=e.asm.ka).apply(null,arguments)};e._sqlite3_column_text=function(){return(e._sqlite3_column_text=e.asm.la).apply(null,arguments)};e._sqlite3_column_type=function(){return(e._sqlite3_column_type=e.asm.ma).apply(null,arguments)};e._sqlite3_column_name=function(){return(e._sqlite3_column_name=e.asm.na).apply(null,arguments)};e._sqlite3_bind_blob=function(){return(e._sqlite3_bind_blob=e.asm.oa).apply(null,arguments)};
e._sqlite3_bind_double=function(){return(e._sqlite3_bind_double=e.asm.pa).apply(null,arguments)};e._sqlite3_bind_int=function(){return(e._sqlite3_bind_int=e.asm.qa).apply(null,arguments)};e._sqlite3_bind_text=function(){return(e._sqlite3_bind_text=e.asm.ra).apply(null,arguments)};e._sqlite3_bind_parameter_index=function(){return(e._sqlite3_bind_parameter_index=e.asm.sa).apply(null,arguments)};e._sqlite3_errmsg=function(){return(e._sqlite3_errmsg=e.asm.ta).apply(null,arguments)};
e._sqlite3_exec=function(){return(e._sqlite3_exec=e.asm.ua).apply(null,arguments)};e._sqlite3_prepare_v2=function(){return(e._sqlite3_prepare_v2=e.asm.va).apply(null,arguments)};e._sqlite3_changes=function(){return(e._sqlite3_changes=e.asm.wa).apply(null,arguments)};e._sqlite3_close_v2=function(){return(e._sqlite3_close_v2=e.asm.xa).apply(null,arguments)};e._sqlite3_create_function_v2=function(){return(e._sqlite3_create_function_v2=e.asm.ya).apply(null,arguments)};
e._sqlite3_open=function(){return(e._sqlite3_open=e.asm.za).apply(null,arguments)};var Ta=e._malloc=function(){return(Ta=e._malloc=e.asm.Aa).apply(null,arguments)},ma=e._free=function(){return(ma=e._free=e.asm.Ba).apply(null,arguments)};e._RegisterExtensionFunctions=function(){return(e._RegisterExtensionFunctions=e.asm.Ca).apply(null,arguments)};
var wb=e.__get_tzname=function(){return(wb=e.__get_tzname=e.asm.Da).apply(null,arguments)},ub=e.__get_daylight=function(){return(ub=e.__get_daylight=e.asm.Ea).apply(null,arguments)},tb=e.__get_timezone=function(){return(tb=e.__get_timezone=e.asm.Fa).apply(null,arguments)},na=e.stackSave=function(){return(na=e.stackSave=e.asm.Ga).apply(null,arguments)},ra=e.stackRestore=function(){return(ra=e.stackRestore=e.asm.Ha).apply(null,arguments)},u=e.stackAlloc=function(){return(u=e.stackAlloc=e.asm.Ia).apply(null,
arguments)},dd=e._memalign=function(){return(dd=e._memalign=e.asm.Ja).apply(null,arguments)};e.cwrap=function(a,b,c,d){c=c||[];var f=c.every(function(g){return"number"===g});return"string"!==b&&f&&!d?Pa(a):function(){return Qa(a,b,c,arguments)}};e.stackSave=na;e.stackRestore=ra;e.stackAlloc=u;var gd;gb=function hd(){gd||id();gd||(gb=hd)};
function id(){function a(){if(!gd&&(gd=!0,e.calledRun=!0,!Oa)){e.noFSInit||Rc||(Rc=!0,Qc(),e.stdin=e.stdin,e.stdout=e.stdout,e.stderr=e.stderr,e.stdin?Sc("stdin",e.stdin):hc("/dev/tty","/dev/stdin"),e.stdout?Sc("stdout",null,e.stdout):hc("/dev/tty","/dev/stdout"),e.stderr?Sc("stderr",null,e.stderr):hc("/dev/tty1","/dev/stderr"),m("/dev/stdin","r"),m("/dev/stdout","w"),m("/dev/stderr","w"));nb(ab);Rb=!1;nb(bb);if(e.onRuntimeInitialized)e.onRuntimeInitialized();if(e.postRun)for("function"==typeof e.postRun&&
(e.postRun=[e.postRun]);e.postRun.length;){var b=e.postRun.shift();cb.unshift(b)}nb(cb)}}if(!(0<eb)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;)db();nb($a);0<eb||(e.setStatus?(e.setStatus("Running..."),setTimeout(function(){setTimeout(function(){e.setStatus("")},1);a()},1)):a())}}e.run=id;if(e.preInit)for("function"==typeof e.preInit&&(e.preInit=[e.preInit]);0<e.preInit.length;)e.preInit.pop()();noExitRuntime=!0;id();


        // The shell-pre.js and emcc-generated code goes above
        return Module;
    }); // The end of the promise being returned

  return initSqlJsPromise;
} // The end of our initSqlJs function

// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
// However, we don't want to use the emcc modularization. See shell-pre.js
if (typeof exports === 'object' && typeof module === 'object'){
    module.exports = initSqlJs;
    // This will allow the module to be used in ES6 or CommonJS
    module.exports.default = initSqlJs;
}
else if (typeof define === 'function' && define['amd']) {
    define([], function() { return initSqlJs; });
}
else if (typeof exports === 'object'){
    exports["Module"] = initSqlJs;
}
/* global initSqlJs */
/* eslint-env worker */
/* eslint no-restricted-globals: ["error"] */

"use strict";

var db;

function onModuleReady(SQL) {
    function createDb(data) {
        if (db != null) db.close();
        db = new SQL.Database(data);
        return db;
    }

    var buff; var data; var result;
    data = this["data"];
    switch (data && data["action"]) {
        case "open":
            buff = data["buffer"];
            createDb(buff && new Uint8Array(buff));
            return postMessage({
                id: data["id"],
                ready: true
            });
        case "exec":
            if (db === null) {
                createDb();
            }
            if (!data["sql"]) {
                throw "exec: Missing query string";
            }
            return postMessage({
                id: data["id"],
                results: db.exec(data["sql"], data["params"])
            });
        case "each":
            if (db === null) {
                createDb();
            }
            var callback = function callback(row) {
                return postMessage({
                    id: data["id"],
                    row: row,
                    finished: false
                });
            };
            var done = function done() {
                return postMessage({
                    id: data["id"],
                    finished: true
                });
            };
            return db.each(data["sql"], data["params"], callback, done);
        case "export":
            buff = db["export"]();
            result = {
                id: data["id"],
                buffer: buff
            };
            try {
                return postMessage(result, [result]);
            } catch (error) {
                return postMessage(result);
            }
        case "close":
            if (db) {
                db.close();
            }
            return postMessage({
                id: data["id"]
            });
        default:
            throw new Error("Invalid action : " + (data && data["action"]));
    }
}

function onError(err) {
    return postMessage({
        id: this["data"]["id"],
        error: err["message"]
    });
}

if (typeof importScripts === "function") {
    db = null;
    var sqlModuleReady = initSqlJs();
    self.onmessage = function onmessage(event) {
        return sqlModuleReady
            .then(onModuleReady.bind(event))
            .catch(onError.bind(event));
    };
}
