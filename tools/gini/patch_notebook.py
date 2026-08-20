"""
Insert the missing install step into the Colab notebook.

The official Hunyuan3D-2 install is:
    pip install -r requirements.txt
    pip install -e .                      <-- we were missing this
    (then two setup.py builds for texture)

Without `pip install -e .` the repo's own package is never registered, so
`from hy3dgen.shapegen import ...` in cell 5 raises ModuleNotFoundError after
you have already waited through the whole dependency install.

    python tools/gini/patch_notebook.py
"""

import json
import os

HERE = os.path.dirname(os.path.realpath(__file__))
NB = os.path.join(HERE, "Gini_3D_Colab.ipynb")

CELL_SRC = [
    "#@title 2b. Finish the install (REQUIRED)  { display-mode: \"form\" }\n",
    "# `pip install -e .` registers the repo's own package. Without it,\n",
    "# `import hy3dgen` fails in cell 5. The two setup.py builds add texture\n",
    "# support and compile CUDA extensions -- they are allowed to fail, because\n",
    "# an untextured mesh is still perfectly usable and can be shaded in Blender.\n",
    "import subprocess, sys, os\n",
    "\n",
    "%cd /content/Hunyuan3D-2\n",
    "!pip install -q -e .\n",
    "\n",
    "# The texture extensions are OPTIONAL and their paths vary between revisions\n",
    "# of this repo -- the README documents hy3dgen/texgen/custom_rasterizer, which\n",
    "# does not exist in every clone. Skip anything missing instead of raising:\n",
    "# an untextured mesh is still exactly what we need, and Blender can shade it.\n",
    "for sub in ['hy3dgen/texgen/custom_rasterizer',\n",
    "            'hy3dgen/texgen/differentiable_renderer']:\n",
    "    path = f'/content/Hunyuan3D-2/{sub}'\n",
    "    if not os.path.isdir(path):\n",
    "        print(f'skip {sub} (not present in this clone)')\n",
    "        continue\n",
    "    print('building', sub, '...')\n",
    "    r = subprocess.run([sys.executable, 'setup.py', 'install'],\n",
    "                       cwd=path, capture_output=True, text=True)\n",
    "    print('   OK' if r.returncode == 0 else\n",
    "          f'   FAILED (texture will be skipped)\\n{r.stderr[-500:]}')\n",
    "\n",
    "# THE check that decides whether cell 5 can run.\n",
    "from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline\n",
    "print('\\nSHAPE PIPELINE IMPORT OK -- cell 5 will work')\n",
]


def main():
    nb = json.load(open(NB, encoding="utf-8"))
    cells = nb["cells"]

    if any("2b. Finish the install" in "".join(c.get("source", [])) for c in cells):
        print("already patched")
        return

    # Insert immediately after the dependency-install cell.
    idx = next(i for i, c in enumerate(cells)
               if "Install Hunyuan3D-2" in "".join(c.get("source", [])))
    cells.insert(idx + 1, {
        "cell_type": "code",
        "metadata": {},
        "source": CELL_SRC,
        "execution_count": None,
        "outputs": [],
    })

    json.dump(nb, open(NB, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(f"patched: inserted cell 2b at index {idx + 1}; total cells = {len(cells)}")


if __name__ == "__main__":
    main()
