"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = 'https://ctzaqsuzytydagbuhcmh.supabase.co';
var supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emFxc3V6eXR5ZGFnYnVoY21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzI1MDYsImV4cCI6MjEwMjY0ODUwNn0.qo66yfKQ-9E-IPoM9H9j_4rQym8FG5yTSH-SjRhAYJQ';
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
function check() {
    return __awaiter(this, void 0, void 0, function () {
        var ingresos, gastos, ingARS, gastosARS, gastosPorObra;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase.from('ingresos').select('monto, moneda')];
                case 1:
                    ingresos = (_a.sent()).data;
                    return [4 /*yield*/, supabase.from('gastos').select('*')];
                case 2:
                    gastos = (_a.sent()).data;
                    ingARS = 0;
                    ingresos === null || ingresos === void 0 ? void 0 : ingresos.forEach(function (i) {
                        if (i.moneda !== 'USD')
                            ingARS += (i.monto || 0);
                    });
                    gastosARS = 0;
                    gastosPorObra = {};
                    gastos === null || gastos === void 0 ? void 0 : gastos.forEach(function (g) {
                        var _a, _b;
                        if (g.moneda !== 'USD') {
                            gastosARS += (g.amount || 0);
                            var obra = ((_b = (_a = g.subtitle) === null || _a === void 0 ? void 0 : _a.split(' • ')[0]) === null || _b === void 0 ? void 0 : _b.trim()) || 'Desconocida';
                            gastosPorObra[obra] = (gastosPorObra[obra] || 0) + (g.amount || 0);
                        }
                    });
                    console.log("Total Ingresos ARS: ".concat(ingARS));
                    console.log("Total Gastos ARS: ".concat(gastosARS));
                    console.log("Diferencia (Gastos - Ingresos): ".concat(gastosARS - ingARS));
                    console.log('Gastos por Obra:', gastosPorObra);
                    return [2 /*return*/];
            }
        });
    });
}
check();
