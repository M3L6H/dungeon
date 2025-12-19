{
  description = "A simple web-based roguelike dungeon crawler";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default =
          with pkgs;
          mkShell {
            buildInputs = [
              python3
            ];

            shellHook = ''
              if [ -n "$XDG_SESSION_TYPE" ]; then
                echo "Starting local web server"
                cd src && python3 -m http.server 3000
              fi
            '';
          };
      }
    );
}
