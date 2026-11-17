"""Queue helper: python reasm.py <video> render  ->  multik.py <video> assemble"""
import os, subprocess, sys
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "multik.py"), sys.argv[1], "assemble"], check=True)
