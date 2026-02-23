let
  nixpkgs-nodejs_24-commit = "16c7794d0a28b5a37904d55bcca36003b9109aaa";

  node_pkgs =
    import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/${nixpkgs-nodejs_24-commit}.tar.gz")
      { };
in
node_pkgs.mkShell {
  nativeBuildInputs = [
    node_pkgs.nodejs_24
    node_pkgs.pnpm
    node_pkgs.typescript
  ];
}
