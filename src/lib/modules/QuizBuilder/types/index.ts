import {
    CircleDot,
    CheckSquare,
    ArrowUpDown,
    GripHorizontal,
    Shuffle,
    PenTool,
    Type,
    MousePointerClick,
    Calculator,
    AlignLeft,
    MapPin,
    Image as ImageIcon,
    Grid,
    FileText
} from 'lucide-svelte';

export const QUESTION_TYPES = [
    { id: 'mcq', name: 'اختيار من متعدد', icon: CircleDot, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'true_false', name: 'صح أو خطأ', icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'ordering', name: 'ترتيب متسلسل', icon: ArrowUpDown, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'drag_drop', name: 'سحب وإفلات / تصنيف', icon: GripHorizontal, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { id: 'matching', name: 'ربط', icon: Shuffle, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { id: 'fill_blank', name: 'أكمل الفراغ', icon: PenTool, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { id: 'short_answer', name: 'إجابة قصيرة', icon: Type, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { id: 'cloze', name: 'اختيار من القائمة', icon: MousePointerClick, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { id: 'calculated', name: 'حسابي متغير', icon: Calculator, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    { id: 'sentence_reorder', name: 'إعادة ترتيب جملة', icon: AlignLeft, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { id: 'hotspot', name: 'تحديد على صورة', icon: MapPin, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
    { id: 'drag_to_image', name: 'سحب إلى صورة', icon: ImageIcon, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { id: 'matrix', name: 'مصفوفة', icon: Grid, color: 'text-lime-500', bg: 'bg-lime-500/10', border: 'border-lime-500/20' },
    { id: 'essay', name: 'مقال / إجابة طويلة', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' }
];

export function getQuestionType(id: string) {
    return QUESTION_TYPES.find(t => t.id === id) || { 
        id, 
        name: id, 
        icon: CircleDot, 
        color: 'text-muted-foreground', 
        bg: 'bg-muted', 
        border: 'border-border' 
    };
}

// Upgraded generic definitions with Universal Image Support
export function getDefaultDataForType(type: string) {
    switch (type) {
        case 'mcq':
            // options now an array of objects to support images: { text: string, imageUrl?: string }
            return { options: [], correctIndices: [] };
        case 'true_false':
            return { correctAnswer: true };
        case 'ordering':
            // items: { id: string, text: string, imageUrl?: string }
            return { items: [] };
        case 'drag_drop':
            // items: { text: string, imageUrl?: string, category: string }
            return { categories: [], items: [] };
        case 'matching':
            // pairs: { left: { text: string, imageUrl?: string }, right: { text: string, imageUrl?: string } }
            return { pairs: [] };
        case 'fill_blank':
            return { acceptedAnswers: [] };
        case 'short_answer':
            return { acceptedKeywords: [] };
        case 'cloze':
            return { options: [] };
        case 'calculated':
            return { formula: '', displayTemplate: '', variables: [], tolerance: 0 };
        case 'sentence_reorder':
            return { words: [], correctOrder: [] };
        case 'hotspot':
            return { imageUrl: '', zones: [], correctZone: 0 };
        case 'drag_to_image':
            // labels: { id: string, text: string, x: number, y: number, imageUrl?: string }
            return { imageUrl: '', labels: [] };
        case 'matrix':
            // statements: { text: string, imageUrl?: string }
            return { statements: [], columns: ['صحيح', 'خطأ'], correctAnswers: [] };
        case 'essay':
            return { minWords: 0, maxWords: 0, keywords: [] };
        default:
            return {};
    }
}
