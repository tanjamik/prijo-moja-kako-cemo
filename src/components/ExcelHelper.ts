import * as XLSX from 'xlsx';
import { Person, CustomField } from '../types';

// Human-readable headers for export and matching for import
const HEADER_MAPPING: { [key: string]: string } = {
  imePrezime: 'Ime i prezime',
  uloga: 'Uloga',
  status: 'Status',
  faza: 'Faza',
  bm: 'BM',
  telefon: 'Telefon',
  email: 'Email',
  auto: 'Poseduje auto (Da/Ne)',
  iskustvo: 'Iskustvo na izborima (Da/Ne)',
  obukaOsnovna: 'Završen osnovni trening (Da/Ne)',
  obukaNapredna: 'Završen napredni trening (Da/Ne)',
  rasporedjen: 'Raspoređen (Da/Ne)',
  napomene: 'Napomene',
  poreklo: 'Poreklo',
  odPoverenja: 'Osoba od poverenja (Da/Ne)'
};

// Reverse mapping for parsing imports
const REVERSE_HEADER_MAPPING: { [key: string]: string } = {};
Object.entries(HEADER_MAPPING).forEach(([key, value]) => {
  REVERSE_HEADER_MAPPING[value.toLowerCase().trim()] = key;
});

export function exportToExcel(people: Person[], customFields: CustomField[]) {
  // Format data for export
  const exportData = people.map((p) => {
    const row: { [key: string]: any } = {};
    
    // Core fields
    row[HEADER_MAPPING.imePrezime] = p.imePrezime || '';
    row[HEADER_MAPPING.uloga] = p.uloga || '';
    row[HEADER_MAPPING.status] = p.status || '';
    row[HEADER_MAPPING.faza] = p.faza || '';
    row[HEADER_MAPPING.bm] = p.bm || '';
    row[HEADER_MAPPING.telefon] = p.telefon || '';
    row[HEADER_MAPPING.email] = p.email || '';
    row[HEADER_MAPPING.auto] = p.auto ? 'Da' : 'Ne';
    row[HEADER_MAPPING.iskustvo] = p.iskustvo ? 'Da' : 'Ne';
    row[HEADER_MAPPING.obukaOsnovna] = p.obukaOsnovna ? 'Da' : 'Ne';
    row[HEADER_MAPPING.obukaNapredna] = p.obukaNapredna ? 'Da' : 'Ne';
    row[HEADER_MAPPING.rasporedjen] = p.rasporedjen ? 'Da' : 'Ne';
    row[HEADER_MAPPING.napomene] = p.napomene || '';
    row[HEADER_MAPPING.poreklo] = p.poreklo || '';
    row[HEADER_MAPPING.odPoverenja] = p.odPoverenja ? 'Da' : 'Ne';

    // Custom fields
    customFields.forEach((cf) => {
      row[cf.label] = p[cf.key] !== undefined ? p[cf.key] : '';
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ljudi');

  // Generate buffer and trigger browser download
  XLSX.writeFile(workbook, `struktura_ljudi_izvoz_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function importFromExcel(file: File, customFields: CustomField[]): Promise<{ people: Partial<Person>[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Nije moguće pročitati datoteku.');
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read sheet as JSON array with headers
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);
        const importedPeople: Partial<Person>[] = [];
        const errors: string[] = [];

        rawRows.forEach((rawRow, idx) => {
          const rowNum = idx + 2; // Row number in sheet (1-based + 1 for header)
          const person: Partial<Person> = {
            id: `imported_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
            imePrezime: '',
            uloga: 'kontrolor',
            status: 'potencijalni',
            faza: '—',
            reon: '',
            bm: '',
            telefon: '',
            email: '',
            auto: false,
            iskustvo: false,
            obukaOsnovna: false,
            obukaNapredna: false,
            rasporedjen: false,
            napomene: '',
            poreklo: '',
            odPoverenja: false
          };

          // Map columns to fields
          Object.entries(rawRow).forEach(([colHeader, colValue]) => {
            const cleanedHeader = colHeader.toLowerCase().trim();
            const matchedField = REVERSE_HEADER_MAPPING[cleanedHeader];

            const valStr = String(colValue).trim();
            const isDa = valStr.toLowerCase() === 'da' || valStr.toLowerCase() === 'yes' || valStr === '1' || valStr.toLowerCase() === 'true';

            if (matchedField) {
              if (['auto', 'iskustvo', 'obukaOsnovna', 'obukaNapredna', 'rasporedjen', 'odPoverenja'].includes(matchedField)) {
                person[matchedField] = isDa;
              } else {
                person[matchedField] = valStr;
              }
            } else {
              // Check if it matches any custom field label
              const customField = customFields.find(cf => cf.label.toLowerCase().trim() === cleanedHeader);
              if (customField) {
                if (customField.type === 'boolean') {
                  person[customField.key] = isDa;
                } else if (customField.type === 'number') {
                  person[customField.key] = Number(valStr) || 0;
                } else {
                  person[customField.key] = valStr;
                }
              }
            }
          });

          // Validation
          if (!person.imePrezime) {
            errors.push(`Red ${rowNum}: Nedostaje obavezno polje "Ime i prezime".`);
            return;
          }
          if (!person.telefon) {
            errors.push(`Red ${rowNum}: Nedostaje obavezno polje "Telefon".`);
            return;
          }
          if (!person.email) {
            errors.push(`Red ${rowNum}: Nedostaje obavezno polje "Email".`);
            return;
          }

          importedPeople.push(person);
        });

        resolve({ people: importedPeople, errors });
      } catch (err: any) {
        reject(err.message || err);
      }
    };

    reader.onerror = () => {
      reject('Greška pri čitanju fajla.');
    };

    reader.readAsBinaryString(file);
  });
}
