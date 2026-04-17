from PIL import Image, ImageDraw

def create_logo():
    size = 512
    img = Image.new('RGBA', (size, size), color=(0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    padding = 32
    d.rectangle(
        [(padding, padding), (size - padding, size - padding)],
        fill=(20, 20, 20, 255),
        outline=(40, 40, 40, 255)
    )
    
    orange = (255, 120, 0, 255)
    cx = size // 2
    cy = size // 2
    
    lx = cx - 60
    rx = cx + 20
    ty = cy - 60
    my = cy
    by = cy + 60
    
    d.line([(lx, ty), (rx, my)], fill=orange, width=28, joint="curve")
    d.line([(rx, my), (lx, by)], fill=orange, width=28, joint="curve")
    
    ux1 = cx + 40
    ux2 = cx + 120
    uy1 = cy + 40
    uy2 = cy + 68
    
    d.rectangle([(ux1, uy1), (ux2, uy2)], fill=orange)
    
    img.save("icon.png")
    try:
        img.save("icon.ico", format="ICO", sizes=[(256,256), (128,128), (64,64)])
    except:
        pass # Ignore if ICO fails

if __name__ == "__main__":
    create_logo()
