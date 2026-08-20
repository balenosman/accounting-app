// ==================== global.js (فایلی گشتی سیستەم) ====================

let db = {
  customers: JSON.parse(localStorage.getItem('oil_db_cust_v6')) || [],
  suppliers: JSON.parse(localStorage.getItem('oil_db_supp_v7')) || [],
  materials: JSON.parse(localStorage.getItem('oil_db_mat_v6')) || [],
  readyOil: JSON.parse(localStorage.getItem('oil_db_oil_v6')) || [],
  sales: JSON.parse(localStorage.getItem('oil_db_sal_v6')) || [],
  purchases: JSON.parse(localStorage.getItem('oil_db_pur_v6')) || [],
  productions: JSON.parse(localStorage.getItem('oil_db_prod_v8')) || [],
  expenses: JSON.parse(localStorage.getItem('oil_db_exp_v6')) || []
};

// خەزنکردن و نوێکردنەوەی گشتی
function saveGlobalDB() {
  localStorage.setItem('oil_db_cust_v6', JSON.stringify(db.customers));
  localStorage.setItem('oil_db_supp_v7', JSON.stringify(db.suppliers));
  localStorage.setItem('oil_db_mat_v6', JSON.stringify(db.materials));
  localStorage.setItem('oil_db_oil_v6', JSON.stringify(db.readyOil));
  localStorage.setItem('oil_db_sal_v6', JSON.stringify(db.sales));
  localStorage.setItem('oil_db_pur_v6', JSON.stringify(db.purchases));
  localStorage.setItem('oil_db_prod_v8', JSON.stringify(db.productions));
  localStorage.setItem('oil_db_exp_v6', JSON.stringify(db.expenses));
}

// ١. سڕینەوەی فرۆشتن (دەگەڕێنێتەوە مەخزەنی زەیت و قەرزی کڕیار پاکدەکاتەوە)
function globalDeleteSale(id) {
  const s = db.sales.find(x => x.id === id);
  if (s) {
    const oil = db.readyOil.find(o => o.name === s.productName);
    if (oil) {
      oil.qty += (s.qty + (s.giftCartons || 0));
    }
    if (s.payType === 'قەرز') {
      const cust = db.customers.find(c => c.id === s.customerId);
      if (cust) {
        cust.debtIQD = Math.max(0, (cust.debtIQD || 0) - s.total);
      }
    }
  }
  db.sales = db.sales.filter(x => x.id !== id);
  saveGlobalDB();
}

// ٢. سڕینەوەی کڕین (مەواد لە مەخزەن کەمدەکاتەوە و قەرزی دابینکەر دەگەڕێنێتەوە)
function globalDeletePurchase(id) {
  const p = db.purchases.find(x => x.id === id);
  if (p) {
    const mat = db.materials.find(m => m.id === p.matId);
    if (mat) {
      mat.qty = Math.max(0, (mat.qty || 0) - p.qty);
    }
    const supp = db.suppliers.find(s => s.name === p.suppName);
    if (supp) {
      if (p.currency === 'USD') {
        supp.debtUSD = Math.max(0, (supp.debtUSD || 0) - p.total);
      } else {
        supp.debtIQD = Math.max(0, (supp.debtIQD || 0) - p.total);
      }
    }
  }
  db.purchases = db.purchases.filter(x => x.id !== id);
  saveGlobalDB();
}

// ٣. سڕینەوەی بەرهەمهێنان (زەیتەکە لە مەخزەن دەردەکات و مەوادە خاوەکان دەگەڕێنێتەوە)
function globalDeleteProduction(id) {
  const prod = db.productions.find(x => x.id === id);
  if (prod) {
    const oil = db.readyOil.find(o => o.id === prod.oilId);
    if (oil) {
      oil.qty = Math.max(0, oil.qty - prod.cartonsProduced);
      if (oil.bom && oil.bom.length > 0) {
        oil.bom.forEach(b => {
          const mat = db.materials.find(m => m.id === b.matId);
          if (mat) {
            mat.qty += (b.qty * prod.cartonsProduced);
          }
        });
      }
    }
  }
  db.productions = db.productions.filter(x => x.id !== id);
  saveGlobalDB();
}
