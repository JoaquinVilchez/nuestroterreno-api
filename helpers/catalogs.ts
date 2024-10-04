export type orderTypeValues = 'ASC' | 'DESC';

export const orderByTypes = ['ASC', 'DESC'];

export const drawTypeCatalog = {
  CPD: 'cpd',
  GENERAL: 'general',
};

export const resultTypeCatalog = {
  INCUMBENT: 'incumbent',
  ALTERNATE: 'alternate',
};

export const NumberOfDrawsCatalog = {
  cpd: [
    { group: 1, incumbent: 2, alternate: 8 },
    { group: 2, incumbent: 2, alternate: 8 },
  ],
  general: [
    { group: 1, incumbent: 74, alternate: 74 },
    { group: 2, incumbent: 22, alternate: 22 },
  ],
};

export function generateScheduledDraw() {
  const scheduledDraw = {};

  for (const drawType in NumberOfDrawsCatalog) {
    NumberOfDrawsCatalog[drawType].forEach((draw) => {
      const groupKey = draw.group;
      if (!scheduledDraw[groupKey]) {
        scheduledDraw[groupKey] = [];
      }
      scheduledDraw[groupKey].push({
        drawType: drawType.toLowerCase(),
        resultType: 'incumbent',
        quantity: draw.incumbent,
      });
      scheduledDraw[groupKey].push({
        drawType: drawType.toLowerCase(),
        resultType: 'alternate',
        quantity: draw.alternate,
      });
    });
  }

  return scheduledDraw;
}

export const scheduledDraw = generateScheduledDraw();

export const TranslateCatalog = {
  incumbent: 'titular',
  alternate: 'suplente',
};

export const groups = 2;
