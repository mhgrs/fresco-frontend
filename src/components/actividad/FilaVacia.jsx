export default function FilaVacia({ msg }) {
  return (
    <tr>
      <td colSpan={10} className="py-16 text-center text-gray-400 font-medium">
        {msg}
      </td>
    </tr>
  );
}
