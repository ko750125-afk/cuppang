import fs from 'fs';

// 1. 기존 데이터 읽기
const oldDataRaw = fs.readFileSync('C:/Users/KO/.gemini/antigravity-ide/brain/cca2cb2e-c54c-456b-9533-47135f67e3b1/.system_generated/steps/734/output.txt', 'utf8');
const oldData = JSON.parse(oldDataRaw);

const recordsFields = {};

// 2. 기존 데이터 가공하여 매핑
oldData.documents.forEach(doc => {
  const date = doc.name.split('/').pop();
  const total = parseInt(doc.fields.total.integerValue, 10);
  
  // 6월 3일 수량은 사용자 요청으로 0으로 설정
  const finalTotal = date === '2026-06-03' ? 0 : total;

  recordsFields[date] = {
    mapValue: {
      fields: {
        date: { stringValue: date },
        deliveries: {
          mapValue: {
            fields: {
              "1": { integerValue: String(finalTotal) }
            }
          }
        },
        freshBagCount: { integerValue: "0" }
      }
    }
  };
});

// 3. 2026-06-02 및 2026-06-03 데이터 누락 방지 처리
if (!recordsFields['2026-06-02']) {
  recordsFields['2026-06-02'] = {
    mapValue: {
      fields: {
        date: { stringValue: "2026-06-02" },
        deliveries: {
          mapValue: {
            fields: {
              "1": { integerValue: "0" }
            }
          }
        },
        freshBagCount: { integerValue: "0" }
      }
    }
  };
}
if (!recordsFields['2026-06-03']) {
  recordsFields['2026-06-03'] = {
    mapValue: {
      fields: {
        date: { stringValue: "2026-06-03" },
        deliveries: {
          mapValue: {
            fields: {
              "1": { integerValue: "0" }
            }
          }
        },
        freshBagCount: { integerValue: "0" }
      }
    }
  };
}

// 4. 최종 Firestore update payload 생성
const payload = {
  document: {
    name: "projects/gen-lang-client-0701799372/databases/(default)/documents/cuppang_records/FGEZWVWjNAUniFFargUcP8YC9q52",
    fields: {
      records: {
        mapValue: {
          fields: recordsFields
        }
      }
    }
  }
};

fs.writeFileSync('migrated_payload.json', JSON.stringify(payload, null, 2), 'utf8');
console.log('Migration payload generated successfully!');
