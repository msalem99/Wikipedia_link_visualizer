export default function Arrow({ coords, onClickFunction }) {
  //SVG data was generated by https://fffuel.co/pppointed/
  return (
    <>
      <g
        strokeWidth="3"
        stroke="hsl(180, 69%, 30%)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline
          onClick={(e) => onClickFunction(e)}
          points={coords}
          markerEnd="url(#SvgjsMarker1658)"
        ></polyline>
      </g>
      <defs>
        <marker
          markerWidth="3.5"
          markerHeight="3.5"
          refX="1.75"
          refY="1.75"
          viewBox="0 0 3.5 3.5"
          orient="auto"
          id="SvgjsMarker1658"
        >
          <polygon
            points="1.1666666666666667,3.5 0,1.75 1.1666666666666667,0 3.5,1.75"
            fill="hsl(180, 69%, 30%)"
          ></polygon>
        </marker>
      </defs>
    </>
  );
}