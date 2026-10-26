/** Hi ha un <dialog> modal obert? (els jocs ignoren el teclat físic mentrestant) */
export const isModalOpen = () => document.querySelector('dialog[open]') !== null;
