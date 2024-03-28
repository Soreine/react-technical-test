export function PokemonItemPlaceholder() {
  return (
    <tr>
      <td width="1">
        <img
          src={"src/assets/pokeball.png"}
          style={{
            height: "5em",
          }}
        />
      </td>
      <td colSpan={2}></td>
    </tr>
  );
}
