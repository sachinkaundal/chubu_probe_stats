

export const toHalfWidth = (inputText: string) => {
  const halfWidth = (strVal: string): string => {
    const halfVal = strVal.replace(/[！-～]/g, function (tmpStr) {
      return String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0);
    });
    // eslint-disable-next-line no-irregular-whitespace
    return halfVal.replace(/[\uFF01-\uFF5E]/g, (char) => {
      const fullWidth = '　！＂＃＄％＆＇（）＊￥〜＋，＜＝＞？ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ';
      const halfWidth = ' !"#$%&\'()*\\〜+,<=>?IⅡⅢⅣⅤⅥⅦⅧⅨⅩ';
      const index = fullWidth.indexOf(char);
      return index !== -1 ? halfWidth.charAt(index) : char;
    });
  };
  const halfWidthText = halfWidth(inputText);

  const convertFullToHalfWidth = (inputText: string) => {
    return inputText.replace(/[\s\u3000]/g, '\u0020'); // Replace full-width to half-width spaces
  };
  
  const convertedText = convertFullToHalfWidth(halfWidthText);
  return convertedText;
};

export const isWithinJapanRange = (latitude: number|null|undefined, longitude: number|null|undefined) => {
  const japanLatitudeRange = [24.396308, 45.551483];
  const japanLongitudeRange = [122.934570, 153.986672];

  if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
    return 'Not defined';
  } else {
    return (
      japanLatitudeRange[0] <= latitude &&
      latitude <= japanLatitudeRange[1] &&
      japanLongitudeRange[0] <= longitude &&
      longitude <= japanLongitudeRange[1]
    );
  }
};