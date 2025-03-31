export interface MenuSection {
    title: string;
    options: string[];
  }
  
  export interface Menu {
    logistics: MenuSection;
    afterSales: MenuSection;
    payments: MenuSection;
    cancelations: MenuSection;
    partners: MenuSection;
    others: MenuSection;
  }