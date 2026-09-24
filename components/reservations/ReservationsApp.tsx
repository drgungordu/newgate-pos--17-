
import React, { useState, useEffect } from 'react';
import { Reservation, Table, DiningTable } from '../../types';
import { Clock, Users, CheckCircle, XCircle, Calendar, MapPin, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { ReservationService } from '../../services/reservationService';

interface ReservationsAppProps {
    reservations: Reservation[];
    onSeatReservation: (reservationId: string, tableId: string) => void;
    tables: Table[]; // For compatibility with existing props
    floorPlanTables?: DiningTable[];
    isConnectedToPos: boolean;
    onUpdateReservation?: (res: Reservation) => void;
}

const ReservationsApp: React.FC<ReservationsAppProps> = ({ 
    reservations: initialReservations, 
    onSeatReservation, 
    tables, 
    floorPlanTables = [],
    isConnectedToPos,
    onUpdateReservation
}) => {
    // If we have an updater, use props as source of truth via parent, else use local state fallback
    const [localReservations, setLocalReservations] = useState<Reservation[]>(initialReservations);
    const reservations = onUpdateReservation ? initialReservations : localReservations;

    const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
    const [showTableSelector, setShowTableSelector] = useState(false);
    const [aiSuggesting, setAiSuggesting] = useState<string | null>(null);
    const [suggestedTableId, setSuggestedTableId] = useState<string | null>(null);

    // Sync with "Backend" service
    useEffect(() => {
        ReservationService.setInitialData(initialReservations);
    }, [initialReservations]);

    const handleSeatClick = (res: Reservation) => {
        setSelectedRes(res);
        setSuggestedTableId(null);
        setShowTableSelector(true);
    };

    const handleAiSuggest = async () => {
        if (!selectedRes) return;
        setAiSuggesting(selectedRes.id);
        const suggestion = await ReservationService.suggestTable(selectedRes, floorPlanTables);
        setSuggestedTableId(suggestion);
        setAiSuggesting(null);
    };

    const confirmSeating = async (tableId: string) => {
        if (selectedRes) {
            const success = await ReservationService.seatReservation(selectedRes.id, tableId);
            if (success) {
                onSeatReservation(selectedRes.id, tableId);
                
                // Update Global State
                if (onUpdateReservation) {
                    onUpdateReservation({ ...selectedRes, status: 'Seated', tableId });
                } else {
                    // Fallback to local state update if not connected
                    const updated = localReservations.map(r => r.id === selectedRes.id ? { ...r, status: 'Seated' as const, tableId } : r);
                    setLocalReservations(updated);
                }

                setShowTableSelector(false);
                setSelectedRes(null);
            }
        }
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col animate-fade-in">
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-indigo-600" /> Reservations View
                </h2>
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isConnectedToPos ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{isConnectedToPos ? 'Service Online' : 'Local Mode'}</span>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservations.map(res => (
                        <div key={res.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{res.customerName}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                        <Clock size={14} /> {res.time}
                                        <span>•</span>
                                        <Users size={14} /> {res.partySize} ppl
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                    res.status === 'Seated' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    res.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {res.status}
                                </span>
                            </div>
                            
                            {res.notes && (
                                <div className="bg-slate-50 border border-slate-100 p-2 rounded text-xs text-slate-600 mb-4 italic">
                                    "{res.notes}"
                                </div>
                            )}

                            {res.status === 'Booked' && (
                                <button 
                                    onClick={() => handleSeatClick(res)}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Seat Party <ArrowRight size={16} />
                                </button>
                            )}
                            {res.status === 'Seated' && res.tableId && (
                                <div className="text-center py-2 bg-slate-100 rounded-lg text-slate-700 text-sm font-bold border border-slate-200">
                                    Seated at Table {floorPlanTables.find(t => t.id === res.tableId)?.name || res.tableId}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Selector Modal */}
            {showTableSelector && selectedRes && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 animate-scale-in">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Assign Table</h3>
                                <p className="text-slate-500">{selectedRes.customerName} • Party of {selectedRes.partySize}</p>
                            </div>
                            <button onClick={() => setShowTableSelector(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={28} /></button>
                        </div>

                        {/* AI Suggestion Area */}
                        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Sparkles className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">AI Seating Suggestion</p>
                                    <p className="text-xs text-indigo-700">Gemini will find the most efficient table for this group.</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleAiSuggest}
                                disabled={!!aiSuggesting}
                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md disabled:opacity-50"
                            >
                                {aiSuggesting ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {aiSuggesting ? 'Thinking...' : 'Get Suggestion'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 max-h-60 overflow-y-auto pr-2">
                            {floorPlanTables.filter(t => t.isSeatable).map(table => (
                                <button
                                    key={table.id}
                                    disabled={table.status !== 'Available'}
                                    onClick={() => confirmSeating(table.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all relative
                                        ${suggestedTableId === table.id ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 
                                          table.status === 'Available' 
                                            ? 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50' 
                                            : 'border-slate-100 bg-slate-100 opacity-50 cursor-not-allowed'}`}
                                >
                                    {suggestedTableId === table.id && (
                                        <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-lg">
                                            <Sparkles size={12} />
                                        </span>
                                    )}
                                    <span className="font-bold block text-slate-800 text-lg">Table {table.name}</span>
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">{table.seats} Seats • {table.status}</span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button onClick={() => setShowTableSelector(false)} className="px-6 py-2 text-slate-500 font-bold hover:text-slate-700 uppercase tracking-widest text-xs">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationsApp;
