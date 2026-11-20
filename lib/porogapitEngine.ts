export interface PorogapitStepSubtraction {
  currentVal: number;
  minusVal: number;
  resultVal: number;
  subtractionIndex: number; // 1, 2, 3...
}

export interface PorogapitStage {
  stageIndex: number;
  title: string;
  startVal: number;
  subtractions: PorogapitStepSubtraction[];
  subtractionsCount: number; // Berapa kali dikurangi
  quotientDigit: string; // Digit yang ditulis di atas (e.g. "4", "1", "0,", "2")
  remainder: number;
  broughtDownDigit?: string; // Digit yang diturunkan berikutnya (misal "5")
  isDecimalStep?: boolean; // Apakah langkah ini adalah langkah desimal (pinjam 0)
}

export interface PorogapitSolution {
  num1: number;
  num2: number;
  quotientStr: string; // e.g. "41" atau "0,5" atau "41,2"
  numericAnswer: number; // 41 atau 0.5 atau 41.2
  isDecimal: boolean;
  stages: PorogapitStage[];
  initialChunk: number;
  initialChunkDigitCount: number;
  decimalPrefix: string;
  zerosAdded: number;
}

/**
 * Menyelesaikan pembagian menggunakan algoritma Porogapit dengan metode Pengurangan Berulang
 * Mendukung pembagian bilangan bulat habis maupun bilangan desimal (koma).
 */
export function solvePorogapit(num1: number, num2: number): PorogapitSolution {
  if (num2 <= 0) {
    throw new Error("Pembagi harus lebih besar dari 0");
  }

  const numericAnswer = num1 / num2;
  const isDecimal = !Number.isInteger(numericAnswer);
  
  // Format string hasil bagi dalam standar desimal Indonesia (koma)
  let quotientStr = numericAnswer.toString().replace(".", ",");
  // Batasi maksimal 2 angka di belakang koma untuk desimal tak terhingga/panjang
  if (quotientStr.includes(",")) {
    const parts = quotientStr.split(",");
    if (parts[1].length > 2) {
      quotientStr = Number(numericAnswer.toFixed(2)).toString().replace(".", ",");
    }
  }

  const stages: PorogapitStage[] = [];
  const sNum1 = num1.toString();

  // KASUS 1: Bilangan yang dibagi LEBIH KECIL dari pembagi (misal 12 : 24)
  if (num1 < num2) {
    let currentVal = num1 * 10; // Pinjam 0 pertama -> 120
    let decimalPrefix = "0,";
    
    // Jika masih lebih kecil (misal 1 : 200 -> 10 < 200 -> 100 < 200), tambahkan 0 lagi
    while (currentVal < num2 && decimalPrefix.length < 5) {
      currentVal *= 10;
      decimalPrefix += "0";
    }

    const times = Math.floor(currentVal / num2);
    const subtractions: PorogapitStepSubtraction[] = [];
    let temp = currentVal;
    for (let i = 1; i <= times; i++) {
      subtractions.push({
        currentVal: temp,
        minusVal: num2,
        resultVal: temp - num2,
        subtractionIndex: i,
      });
      temp -= num2;
    }

    stages.push({
      stageIndex: 1,
      title: `Tahap Desimal: Karena ${num1} < ${num2}, tulis "0," di atas dan tambah 0 menjadi ${currentVal}`,
      startVal: currentVal,
      subtractions,
      subtractionsCount: times,
      quotientDigit: `${decimalPrefix}${times}`,
      remainder: temp,
      isDecimalStep: true,
    });

    // Jika masih ada sisa untuk tahap desimal kedua (misal 15 : 40 = 0,375)
    if (temp > 0 && stages.length < 3) {
      const nextVal = temp * 10;
      const nextTimes = Math.floor(nextVal / num2);
      const nextSubtractions: PorogapitStepSubtraction[] = [];
      let temp2 = nextVal;
      for (let i = 1; i <= nextTimes; i++) {
        nextSubtractions.push({
          currentVal: temp2,
          minusVal: num2,
          resultVal: temp2 - num2,
          subtractionIndex: i,
        });
        temp2 -= num2;
      }

      stages.push({
        stageIndex: 2,
        title: `Tahap Desimal Lanjutan: Tambah 0 ke sisa ${temp} menjadi ${nextVal}`,
        startVal: nextVal,
        subtractions: nextSubtractions,
        subtractionsCount: nextTimes,
        quotientDigit: nextTimes.toString(),
        remainder: temp2,
        isDecimalStep: true,
      });
    }

    return {
      num1,
      num2,
      quotientStr,
      numericAnswer,
      isDecimal,
      stages,
      initialChunk: currentVal,
      initialChunkDigitCount: sNum1.length,
      decimalPrefix,
      zerosAdded: decimalPrefix.length - 1,
    };
  }

  // KASUS 2: Bilangan yang dibagi >= Pembagi (misal 615 : 15 atau 72 : 3)
  let digitIdx = 0;
  let currentChunk = 0;

  // Tentukan kelompok digit awal yang >= num2
  while (currentChunk < num2 && digitIdx < sNum1.length) {
    currentChunk = currentChunk * 10 + parseInt(sNum1[digitIdx], 10);
    digitIdx++;
  }

  const initialChunk = currentChunk;
  const initialChunkDigitCount = digitIdx;

  let stageNum = 1;
  while (true) {
    const times = Math.floor(currentChunk / num2);
    const subtractions: PorogapitStepSubtraction[] = [];
    let temp = currentChunk;

    for (let i = 1; i <= times; i++) {
      subtractions.push({
        currentVal: temp,
        minusVal: num2,
        resultVal: temp - num2,
        subtractionIndex: i,
      });
      temp -= num2;
    }

    const remainder = temp;
    let broughtDownDigit: string | undefined = undefined;
    let nextChunk = remainder;

    if (digitIdx < sNum1.length) {
      // Masih ada digit bilangan asli yang belum diturunkan
      broughtDownDigit = sNum1[digitIdx];
      nextChunk = remainder * 10 + parseInt(broughtDownDigit, 10);
      digitIdx++;
    }

    stages.push({
      stageIndex: stageNum,
      title:
        stageNum === 1
          ? `Ambil angka ${currentChunk}`
          : `Pengurangan kelompok ${currentChunk}`,
      startVal: currentChunk,
      subtractions,
      subtractionsCount: times,
      quotientDigit: times.toString(),
      remainder,
      broughtDownDigit,
      isDecimalStep: false,
    });

    stageNum++;

    // Jika digit asli sudah habis
    if (digitIdx >= sNum1.length && !broughtDownDigit) {
      // Jika sisa = 0, pembagian selesai!
      if (remainder === 0) {
        break;
      }

      // Jika masih ada sisa, masuk ke mode DESIMAL (tambah koma & pinjam 0)
      if (remainder > 0 && stages.length < 5) {
        let decVal = remainder * 10;
        let decTimes = Math.floor(decVal / num2);
        const decSubtractions: PorogapitStepSubtraction[] = [];
        let dTemp = decVal;

        for (let i = 1; i <= decTimes; i++) {
          decSubtractions.push({
            currentVal: dTemp,
            minusVal: num2,
            resultVal: dTemp - num2,
            subtractionIndex: i,
          });
          dTemp -= num2;
        }

        stages.push({
          stageIndex: stageNum,
          title: `Masuk Desimal: Sisa ${remainder}, pasang koma (,) di atas dan tambah 0 menjadi ${decVal}`,
          startVal: decVal,
          subtractions: decSubtractions,
          subtractionsCount: decTimes,
          quotientDigit: decTimes.toString(),
          remainder: dTemp,
          isDecimalStep: true,
        });

        // Jika masih ada sisa kedua pada desimal (misal 15 : 4 = 3,75)
        if (dTemp > 0 && stages.length < 5) {
          stageNum++;
          let decVal2 = dTemp * 10;
          let decTimes2 = Math.floor(decVal2 / num2);
          const decSubtractions2: PorogapitStepSubtraction[] = [];
          let dTemp2 = decVal2;

          for (let i = 1; i <= decTimes2; i++) {
            decSubtractions2.push({
              currentVal: dTemp2,
              minusVal: num2,
              resultVal: dTemp2 - num2,
              subtractionIndex: i,
            });
            dTemp2 -= num2;
          }

          stages.push({
            stageIndex: stageNum,
            title: `Desimal Tahap 2: Tambah 0 ke sisa ${dTemp} menjadi ${decVal2}`,
            startVal: decVal2,
            subtractions: decSubtractions2,
            subtractionsCount: decTimes2,
            quotientDigit: decTimes2.toString(),
            remainder: dTemp2,
            isDecimalStep: true,
          });
        }
      }
      break;
    }

    currentChunk = nextChunk;

    // Keamanan infinite loop
    if (stageNum > 10) break;
  }

  return {
    num1,
    num2,
    quotientStr,
    numericAnswer,
    isDecimal,
    stages,
    initialChunk,
    initialChunkDigitCount,
    decimalPrefix: "",
    zerosAdded: 0,
  };
}
