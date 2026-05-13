const t=()=>typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;export{t as g};
