import QRCodeUtil from "qrcode";
import { ReactElement, useMemo } from "react";
import { qrCodeWrapper, qrCode } from "./styles.css";

const generateMatrix = (
  value: string,
  errorCorrectionLevel: QRCodeUtil.QRCodeErrorCorrectionLevel
) => {
  const arr = Array.prototype.slice.call(
    QRCodeUtil.create(value, { errorCorrectionLevel }).modules.data,
    0
  );
  const sqrt = Math.sqrt(arr.length);
  return arr.reduce(
    (rows, key, index) =>
      (index % sqrt === 0
        ? rows.push([key])
        : rows[rows.length - 1].push(key)) && rows,
    []
  );
};

type Props = {
  ecl?: QRCodeUtil.QRCodeErrorCorrectionLevel;
  logoUrl?: string;
  logoMargin?: number;
  logoSize?: number;
  size?: number;
  uri: string;
};

export function QRCode({ ecl = "M", size: sizeProp = 200, uri }: Props) {
  const padding = "20";
  const size = sizeProp - parseInt(padding, 10) * 2;

  const squares = useMemo(() => {
    const squares: ReactElement[] = [];
    const matrix = generateMatrix(uri, ecl);
    const cellSize = size / matrix.length;
    const qrList = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];

    qrList.forEach(({ x, y }) => {
      const x1 = (matrix.length - 7) * cellSize * x;
      const y1 = (matrix.length - 7) * cellSize * y;
      for (let i = 0; i < 3; i++) {
        squares.push(
          <rect
            fill={i % 2 !== 0 ? "white" : "black"}
            height={cellSize * (7 - i * 2)}
            key={`${i}-${x}-${y}`}
            width={cellSize * (7 - i * 2)}
            x={x1 + cellSize * i}
            y={y1 + cellSize * i}
          />
        );
      }
    });

    matrix.forEach((row: QRCodeUtil.QRCode[], i: number) => {
      row.forEach((_, j) => {
        if (matrix[i][j]) {
          if (
            !(
              (i < 7 && j < 7) ||
              (i > matrix.length - 8 && j < 7) ||
              (i < 7 && j > matrix.length - 8)
            )
          ) {
            squares.push(
              <rect
                fill="black"
                height={cellSize}
                key={`square-${i}-${j}`}
                width={cellSize}
                x={i * cellSize}
                y={j * cellSize}
              />
            );
          }
        }
      });
    });

    return squares;
  }, [ecl, size, uri]);

  return (
    <div className={qrCodeWrapper}>
      <div
        className={qrCode}
        style={{
          width: size,
        }}
      />
      <svg height={size} style={{ all: "revert" }} width={size}>
        <title>QR Code</title>
        <rect fill="transparent" height={size} width={size} />
        {squares}
      </svg>
    </div>
  );
}
